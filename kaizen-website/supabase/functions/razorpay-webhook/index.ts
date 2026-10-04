// POST /functions/v1/razorpay-webhook
//
// Server-to-server notification from Razorpay. This is the safety net for cases
// where the customer closes the browser right after paying (so the verify call
// never happens). Deploy with --no-verify-jwt (Razorpay doesn't send a Supabase JWT).
//
// Razorpay Dashboard → Settings → Webhooks:
//   URL:    https://<project-ref>.supabase.co/functions/v1/razorpay-webhook
//   Secret: same value as the RAZORPAY_WEBHOOK_SECRET Supabase secret
//   Events: payment.captured, order.paid, payment.failed
import {
  adminClient, hmacSha256Hex, json, markOrderPaid, requireEnv, safeEqual,
} from '../_shared/razorpay.ts'

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const webhookSecret = requireEnv('RAZORPAY_WEBHOOK_SECRET')

    // Signature must be computed over the RAW body, before JSON parsing
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature') ?? ''
    const expected = await hmacSha256Hex(webhookSecret, rawBody)
    if (!safeEqual(expected, signature)) {
      console.warn('Webhook signature mismatch')
      return json({ error: 'Invalid signature' }, 401)
    }

    const event = JSON.parse(rawBody)
    const payment = event?.payload?.payment?.entity
    const supabase = adminClient()

    switch (event?.event) {
      case 'payment.captured':
      case 'order.paid': {
        const rzpOrderId = payment?.order_id ?? event?.payload?.order?.entity?.id
        if (rzpOrderId && payment?.id) {
          const { newlyPaid } = await markOrderPaid(supabase, rzpOrderId, payment.id, null)
          console.log(`Webhook ${event.event}: ${rzpOrderId} newlyPaid=${newlyPaid}`)
        }
        break
      }
      case 'payment.failed': {
        if (payment?.order_id) {
          // Only downgrade if not already paid (a retry may have succeeded)
          await supabase
            .from('orders')
            .update({ payment_status: 'failed' })
            .eq('razorpay_order_id', payment.order_id)
            .or('payment_status.is.null,payment_status.neq.paid')
        }
        break
      }
      default:
        // Ignore other events but acknowledge them so Razorpay doesn't retry
        break
    }

    return json({ received: true })
  } catch (err) {
    console.error('razorpay-webhook error', err)
    // Non-2xx makes Razorpay retry later, which is what we want on transient errors
    return json({ error: 'Webhook processing failed' }, 500)
  }
})
