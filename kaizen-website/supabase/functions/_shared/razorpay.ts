// Shared helpers for the Razorpay Edge Functions (Deno runtime).
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function requireEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing required secret: ${name}`)
  return value
}

/** Service-role client — bypasses RLS. Never expose this key to the browser. */
export function adminClient(): SupabaseClient {
  return createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  })
}

/** Hex-encoded HMAC-SHA256. */
export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Constant-time string comparison to avoid timing attacks on signatures. */
export function safeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/**
 * Marks an order as paid exactly once (idempotent — safe to call from both the
 * verify endpoint and the webhook). Increments promo usage only on the first transition.
 */
export async function markOrderPaid(
  supabase: SupabaseClient,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string | null,
) {
  const { data: updated, error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'pending', // "Order Placed" — admin moves it to processing/shipped
      razorpay_payment_id: razorpayPaymentId,
      ...(razorpaySignature ? { razorpay_signature: razorpaySignature } : {}),
      paid_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', razorpayOrderId)
    .or('payment_status.is.null,payment_status.neq.paid')
    .select('id, promo_code')

  if (error) throw error

  const first = updated?.[0]
  if (first?.promo_code) {
    await supabase.rpc('increment_promo_usage', { promo_code: first.promo_code })
  }
  return { newlyPaid: Boolean(first) }
}
