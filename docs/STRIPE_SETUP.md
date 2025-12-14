# Stripe Integration Setup Guide

Complete guide to setting up Stripe payments for Humanify's Pro plan.

## Prerequisites

- Stripe account (create at https://stripe.com)
- Stripe CLI (optional, for local webhook testing)

## Step 1: Get Stripe API Keys

1. Go to https://dashboard.stripe.com
2. Toggle to **Test mode** (top right)
3. Go to **Developers → API keys**
4. Copy your keys:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

## Step 2: Create Product and Price

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**
3. Enter details:
   - **Name**: Humanify Pro
   - **Description**: Premium AI text humanization with unlimited usage
   - **Pricing**: Recurring
   - **Price**: $9.99 USD
   - **Billing period**: Monthly
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_...`)

## Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_PRO_PRICE_ID=price_your_price_id_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Set Up Webhooks (Local Development)

### Option A: Using Stripe CLI (Recommended)

1. Install Stripe CLI:
   ```bash
   # Windows (via Scoop)
   scoop install stripe

   # Mac
   brew install stripe/stripe-cli/stripe

   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to localhost:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_...`) and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### Option B: Using ngrok (Alternative)

1. Install ngrok: https://ngrok.com/download
2. Start your Next.js dev server: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the ngrok URL (e.g., https://abc123.ngrok.io)
5. In Stripe Dashboard:
   - Go to **Developers → Webhooks**
   - Click **+ Add endpoint**
   - Endpoint URL: `https://abc123.ngrok.io/api/stripe/webhook`
   - Events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
6. Copy the **Signing secret** to `.env.local`

## Step 5: Test the Integration

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. If using Stripe CLI, start webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. Test the flow:
   - Go to http://localhost:3000/pricing
   - Click "Upgrade to Pro"
   - Use Stripe test card:
     - **Card number**: 4242 4242 4242 4242
     - **Expiry**: Any future date
     - **CVC**: Any 3 digits
     - **ZIP**: Any 5 digits

4. After successful payment:
   - You should be redirected to dashboard
   - Your plan should show as "Pro"
   - Webhook should update the database

5. Test subscription management:
   - Go to Settings
   - Click "Manage Subscription"
   - You should see Stripe customer portal
   - Try canceling subscription (it's test mode, so safe to test!)

## Step 6: Production Setup

When ready to go live:

1. **Switch to Live Mode** in Stripe Dashboard

2. **Get Live API Keys**:
   - Go to Developers → API keys (Live mode)
   - Copy live keys (pk_live_... and sk_live_...)

3. **Create Live Product**:
   - Create the same product in live mode
   - Copy the live price ID

4. **Set Up Production Webhook**:
   - Go to Developers → Webhooks (Live mode)
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select same events as test mode
   - Copy webhook secret

5. **Update Production Environment Variables**:
   ```env
   STRIPE_SECRET_KEY=sk_live_your_live_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
   STRIPE_PRO_PRICE_ID=price_your_live_price_id
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

6. **Important Security Checks**:
   - ✅ Webhook signature verification is enabled
   - ✅ Environment variables are secure
   - ✅ RLS policies are enabled in Supabase
   - ✅ HTTPS is enforced in production

## Troubleshooting

### Webhook not firing?
- Check Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check webhook secret matches in `.env.local`
- Check webhook logs in Stripe Dashboard

### Payment succeeds but plan not upgrading?
- Check webhook endpoint logs: `/api/stripe/webhook`
- Check Supabase database: `subscriptions` table should have new row
- Check `users` table: `plan_type` should be 'pro'

### "Failed to create checkout session" error?
- Verify Stripe secret key is correct
- Verify price ID exists and is correct
- Check API logs for detailed error

## Testing Scenarios

### Test Cards (Test Mode Only)

**Successful Payment**:
- 4242 4242 4242 4242

**Declined Payment**:
- 4000 0000 0000 0002

**Requires Authentication**:
- 4000 0025 0000 3155

### Test Flow Checklist

- [ ] Sign up new user
- [ ] Verify starts on Free plan
- [ ] Click "Upgrade to Pro"
- [ ] Complete Stripe checkout
- [ ] Verify redirected to dashboard with success message
- [ ] Verify plan shows as "Pro"
- [ ] Verify unlimited humanizations work
- [ ] Test "Manage Subscription" button
- [ ] Test canceling subscription
- [ ] Verify downgrade to Free after cancellation

## Stripe Dashboard Monitoring

Monitor these sections regularly:

1. **Payments** - See all transactions
2. **Subscriptions** - See active/cancelled subscriptions
3. **Customers** - See customer details
4. **Webhooks** - Check webhook delivery status
5. **Logs** - Debug API calls

## Support

If you encounter issues:
1. Check Stripe Dashboard → Developers → Logs
2. Check Next.js console logs
3. Check Supabase database directly
4. Refer to Stripe docs: https://stripe.com/docs

## Security Best Practices

✅ **DO**:
- Always verify webhook signatures
- Use environment variables for secrets
- Test thoroughly in test mode first
- Monitor webhook delivery
- Set up error alerts

❌ **DON'T**:
- Commit API keys to git
- Skip webhook signature verification
- Trust client-side data for payments
- Use test keys in production

---

✨ Your Stripe integration is now complete! You can accept payments and manage subscriptions.
