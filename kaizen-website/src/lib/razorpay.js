// Razorpay Checkout helpers (browser side).
// The secret key never touches the browser — orders are created and verified
// by Supabase Edge Functions (see /supabase/functions).
import { supabase } from '../supabase'

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'
let scriptPromise = null

/** Loads checkout.js once and resolves when window.Razorpay is available. */
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true)
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = CHECKOUT_SRC
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => { scriptPromise = null; resolve(false) }
    document.body.appendChild(script)
  })
  return scriptPromise
}

/** Extracts a readable message from a supabase.functions.invoke error. */
async function invokeError(error, fallback) {
  try {
    const body = await error?.context?.json?.()
    if (body?.error) return body.error
  } catch (_) { /* ignore */ }
  return error?.message || fallback
}

export async function createRazorpayOrder(payload) {
  const { data, error } = await supabase.functions.invoke('razorpay-create-order', { body: payload })
  if (error) throw new Error(await invokeError(error, 'Could not start payment.'))
  if (data?.error) throw new Error(data.error)
  return data
}

export async function verifyRazorpayPayment(payload) {
  const { data, error } = await supabase.functions.invoke('razorpay-verify-payment', { body: payload })
  if (error) throw new Error(await invokeError(error, 'Payment verification failed.'))
  if (!data?.verified) throw new Error(data?.error || 'Payment verification failed.')
  return data
}

/**
 * Opens the Razorpay modal. Resolves with the success response, or rejects with
 * { dismissed: true } if the user closes it / { failed: true, message } on failure.
 */
export function openRazorpayCheckout({ order, customer }) {
  return new Promise((resolve, reject) => {
    let settled = false
    const rzp = new window.Razorpay({
      key: order.key_id,
      order_id: order.razorpay_order_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Kaizen 3D Labs',
      description: `Order #${order.order_id.slice(0, 8).toUpperCase()}`,
      image: `${window.location.origin}/kaizen-logo-transparent.png`,
      prefill: {
        name: customer.full_name,
        email: customer.email,
        contact: customer.mobile,
      },
      notes: { supabase_order_id: order.order_id },
      theme: { color: '#6366f1' },
      handler: (response) => { settled = true; resolve(response) },
      modal: {
        confirm_close: true,
        ondismiss: () => { if (!settled) reject({ dismissed: true }) },
      },
    })

    rzp.on('payment.failed', (resp) => {
      // Razorpay keeps the modal open so the user can retry with another method;
      // we only surface the reason. Dismissal is handled by ondismiss.
      console.warn('Razorpay payment failed', resp?.error)
    })

    rzp.open()
  })
}
