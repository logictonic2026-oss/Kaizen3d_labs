// POST /functions/v1/razorpay-verify-payment
//
// Called by the browser after Razorpay Checkout succeeds. Verifies the payment
// signature with the secret key (HMAC-SHA256 of "order_id|payment_id") and only
// then marks the order as paid.
import {
  adminClient, corsHeaders, hmacSha256Hex, json, markOrderPaid, requireEnv, safeEqual,
} from '../_shared/razorpay.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const keySecret = requireEnv('RAZORPAY_KEY_SECRET')
    const body = await req.json().catch(() => ({}))
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body ?? {}

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ verified: false, error: 'Missing payment details' }, 400)
    }

    const expected = await hmacSha256Hex(keySecret, `${razorpay_order_id}|${razorpay_payment_id}`)
    if (!safeEqual(expected, String(razorpay_signature))) {
      return json({ verified: false, error: 'Payment signature mismatch' }, 400)
    }

    const supabase = adminClient()

    // Make sure the Razorpay order really belongs to this Supabase order
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, razorpay_order_id')
      .eq('id', order_id)
      .maybeSingle()
    if (error) throw error
    if (!order || order.razorpay_order_id !== razorpay_order_id) {
      return json({ verified: false, error: 'Order mismatch' }, 400)
    }

    await markOrderPaid(supabase, razorpay_order_id, razorpay_payment_id, razorpay_signature)

    return json({ verified: true, order_id })
  } catch (err) {
    console.error('razorpay-verify-payment error', err)
    return json({ verified: false, error: 'Verification failed. If money was debited, contact support.' }, 500)
  }
})
