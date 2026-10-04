// POST /functions/v1/razorpay-create-order
//
// Creates the order in Supabase and a matching Razorpay order.
// SECURITY: prices, discount, shipping and total are recomputed here from the
// database — the amount sent by the browser is never trusted.
import { adminClient, corsHeaders, json, requireEnv } from '../_shared/razorpay.ts'

const PRIORITY_SHIPPING_FEE = 100 // ₹ — keep in sync with Checkout.jsx
const MAX_QTY_PER_ITEM = 50

type CartLine = { id: string; quantity: number }
type Customer = {
  full_name: string; email: string; mobile: string; alt_mobile?: string
  address: string; landmark?: string; city: string; state: string; pincode: string; country?: string
  company_name?: string; gst_number?: string
}

function bad(message: string, status = 400) {
  return json({ error: message }, status)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return bad('Method not allowed', 405)

  try {
    const keyId = requireEnv('RAZORPAY_KEY_ID')
    const keySecret = requireEnv('RAZORPAY_KEY_SECRET')
    const supabase = adminClient()

    const body = await req.json().catch(() => null)
    if (!body) return bad('Invalid JSON body')

    const customer: Customer = body.customer ?? {}
    const items: CartLine[] = Array.isArray(body.items) ? body.items : []
    const promoCode: string | null = body.promo_code ? String(body.promo_code).trim().toUpperCase() : null
    const shippingMethod = body.shipping_method === 'priority' ? 'priority' : 'standard'

    // ── Validate customer ──
    const required: (keyof Customer)[] = ['full_name', 'email', 'mobile', 'address', 'city', 'state', 'pincode']
    for (const f of required) {
      if (!customer[f] || !String(customer[f]).trim()) return bad(`Missing field: ${f}`)
    }
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) return bad('Invalid email')
    if (!/^[6-9]\d{9}$/.test(String(customer.mobile).replace(/\s/g, ''))) return bad('Invalid mobile number')
    if (!/^\d{6}$/.test(customer.pincode)) return bad('Invalid PIN code')

    // ── Validate cart ──
    if (items.length === 0 || items.length > 50) return bad('Cart is empty or too large')
    const qtyById = new Map<string, number>()
    for (const line of items) {
      const qty = Number(line?.quantity)
      if (!line?.id || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
        return bad('Invalid cart item')
      }
      qtyById.set(line.id, (qtyById.get(line.id) ?? 0) + qty)
    }

    // ── Load authoritative product prices ──
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, name, price, images, is_active')
      .in('id', [...qtyById.keys()])
    if (prodErr) throw prodErr

    const productMap = new Map((products ?? []).map((p) => [p.id, p]))
    const orderItems = []
    let subtotal = 0
    for (const [id, quantity] of qtyById) {
      const p = productMap.get(id)
      if (!p || p.is_active === false) return bad('One or more products are no longer available. Please refresh your cart.')
      const price = Number(p.price)
      subtotal += price * quantity
      orderItems.push({
        product_id: p.id,
        product_name: p.name,
        price_at_purchase: price,
        quantity,
        image_url: Array.isArray(p.images) ? (p.images[0] ?? '') : '',
      })
    }

    // ── Promo code (same rules as the checkout UI) ──
    let discount = 0
    let appliedPromo: string | null = null
    if (promoCode) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode)
        .eq('is_active', true)
        .maybeSingle()

      const valid =
        promo &&
        !(promo.min_order_amount && subtotal < Number(promo.min_order_amount)) &&
        !(promo.expires_at && new Date(promo.expires_at) < new Date()) &&
        !(promo.max_uses && Number(promo.uses_count ?? 0) >= Number(promo.max_uses))
      if (!valid) return bad('Promo code is invalid or no longer applicable.')

      discount = promo.discount_type === 'percentage'
        ? Math.round(subtotal * Number(promo.discount_value) / 100)
        : Number(promo.discount_value)
      discount = Math.min(discount, subtotal)
      appliedPromo = promo.code
    }

    const shippingCost = shippingMethod === 'priority' ? PRIORITY_SHIPPING_FEE : 0
    const total = Math.max(0, subtotal - discount) + shippingCost
    const amountPaise = Math.round(total * 100)
    if (amountPaise < 100) return bad('Order total must be at least ₹1 for online payment.')

    // ── 1. Insert order (status: payment_pending) ──
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_name: customer.full_name.trim(),
        customer_email: customer.email.trim().toLowerCase(),
        customer_phone: String(customer.mobile).trim(),
        alt_phone: customer.alt_mobile?.trim() || null,
        shipping_address: `${customer.address.trim()}${customer.landmark ? ', ' + customer.landmark.trim() : ''}`,
        shipping_city: customer.city.trim(),
        shipping_state: customer.state,
        shipping_zip: customer.pincode.trim(),
        shipping_country: customer.country || 'India',
        company_name: customer.company_name?.trim() || null,
        gst_number: customer.gst_number?.trim().toUpperCase() || null,
        payment_method: 'razorpay',
        payment_status: 'created',
        promo_code: appliedPromo,
        discount_amount: discount,
        shipping_method: shippingMethod,
        shipping_cost: shippingCost,
        subtotal,
        total,
        status: 'payment_pending',
      })
      .select('id')
      .single()
    if (orderErr) throw orderErr

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItems.map((i) => ({ ...i, order_id: order.id })))
    if (itemsErr) {
      await supabase.from('orders').delete().eq('id', order.id)
      throw itemsErr
    }

    // ── 2. Create Razorpay order ──
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${keyId}:${keySecret}`),
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: order.id.slice(0, 40),
        notes: { supabase_order_id: order.id },
      }),
    })
    const rzpOrder = await rzpRes.json()
    if (!rzpRes.ok) {
      console.error('Razorpay order creation failed', rzpOrder)
      await supabase.from('orders').delete().eq('id', order.id)
      return bad('Payment gateway error. Please try again.', 502)
    }

    // ── 3. Link Razorpay order to our order ──
    const { error: linkErr } = await supabase
      .from('orders')
      .update({ razorpay_order_id: rzpOrder.id })
      .eq('id', order.id)
    if (linkErr) throw linkErr

    return json({
      key_id: keyId, // public key — safe to send to the browser
      order_id: order.id,
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      total,
    })
  } catch (err) {
    console.error('razorpay-create-order error', err)
    return json({ error: 'Could not create order. Please try again.' }, 500)
  }
})
