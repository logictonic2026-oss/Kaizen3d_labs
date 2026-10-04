# Razorpay Integration — Setup Guide

## How it works

```
Browser (Checkout.jsx)                 Supabase Edge Functions               Razorpay
──────────────────────                 ───────────────────────               ────────
"Pay Securely" ──── cart + address ──▶ razorpay-create-order
                                        • re-prices cart from DB
                                        • validates promo / shipping
                                        • inserts order (payment_pending)
                                        • POST /v1/orders  ─────────────────▶ order_xxx
             ◀── key_id + order_xxx ───
Razorpay modal opens ──────────────────────────────────────────────────────▶ customer pays
             ◀── payment_id + signature ─────────────────────────────────────
verify ───────────────────────────────▶ razorpay-verify-payment
                                        • HMAC check with secret key
                                        • order → paid / pending
                                                                   ◀──────── webhook (backup)
                                        razorpay-webhook
                                        • HMAC check with webhook secret
                                        • marks paid even if tab was closed
```

The **Key Secret never reaches the browser**, and the amount is **always computed on the server**.

---

## Step 1 — Razorpay account

1. Sign up at https://dashboard.razorpay.com and stay in **Test Mode**.
2. **Settings → API Keys → Generate Test Key** → copy `Key ID` (`rzp_test_...`) and `Key Secret`.
3. **Settings → Payment Capture** → make sure **Automatic capture** is ON.

## Step 2 — Database

Open Supabase → **SQL Editor** → paste and run [`../razorpay-setup.sql`](../razorpay-setup.sql).

## Step 3 — Deploy the Edge Functions

Run these from the `kaizen-website` folder:

```powershell
npx supabase login
npx supabase link --project-ref <your-project-ref>     # from your Supabase URL: https://<ref>.supabase.co

npx supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxxxx RAZORPAY_KEY_SECRET=xxxxx RAZORPAY_WEBHOOK_SECRET=<any-strong-random-string>

npx supabase functions deploy razorpay-create-order
npx supabase functions deploy razorpay-verify-payment
npx supabase functions deploy razorpay-webhook --no-verify-jwt
```

> `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — don't set them.

## Step 4 — Webhook (recommended)

Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**

| Field  | Value |
|--------|-------|
| URL    | `https://<your-project-ref>.supabase.co/functions/v1/razorpay-webhook` |
| Secret | the same `RAZORPAY_WEBHOOK_SECRET` you set above |
| Events | `payment.captured`, `order.paid`, `payment.failed` |

## Step 5 — Test

`npm run dev` → add a product → Checkout → **Pay via Razorpay** → use test details:

| Method | Test value |
|--------|-----------|
| UPI    | `success@razorpay` (success) / `failure@razorpay` (fail) |
| Card   | `4111 1111 1111 1111`, any future expiry, any CVV, OTP any |

Check **Admin → Orders**: the order shows **● PAID** and a Razorpay Payment ID.

## Step 6 — Go live

1. Complete KYC in Razorpay and get your website approved (Terms, Privacy, Refund, Shipping and Contact pages are needed; you already have them).
2. Generate **Live** keys and re-run `supabase secrets set` with the `rzp_live_...` values.
3. Make a new webhook in **Live mode** with the same URL.
4. No frontend redeploy needed — the key ID comes from the server.

---

## Files

| File | Purpose |
|------|---------|
| `supabase/functions/razorpay-create-order` | Re-prices the cart, saves the order, creates the Razorpay order |
| `supabase/functions/razorpay-verify-payment` | Checks the checkout signature and marks the order paid |
| `supabase/functions/razorpay-webhook` | Backup confirmation sent from Razorpay's servers |
| `supabase/functions/_shared/razorpay.ts` | HMAC, CORS, idempotent "mark paid" helper |
| `src/lib/razorpay.js` | Loads checkout.js, calls the functions, opens the modal |
| `src/pages/Checkout.jsx` | Razorpay payment flow (UPI/bank transfer still work as before) |
| `../razorpay-setup.sql` | New columns + RLS hardening |
