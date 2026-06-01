/**
 * Stripe Integration
 *
 * Payment Processing Specialist: Complete Stripe integration for subscription management
 * - Checkout sessions for upgrades
 * - Webhook handling for payment events
 * - Customer portal for subscription management
 */

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

// Initialize Stripe with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17" as any,
  typescript: true,
});

/**
 * Stripe Product and Price IDs
 * You'll need to create these in your Stripe Dashboard and add them to .env.local
 */
export const STRIPE_PRODUCTS = {
  free: {
    name: "Free Plan",
    priceId: process.env.STRIPE_FREE_PRICE_ID || "", // Free has no price
  },
  pro: {
    name: "Pro Plan",
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    price: 9.99, // $9.99/month
    currency: "usd",
  },
};

/**
 * Stripe configuration
 */
export const STRIPE_CONFIG = {
  // Your app's base URL
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Webhook secret for verifying webhook signatures
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",

  // Success/cancel URLs
  successUrl: "/dashboard?payment=success",
  cancelUrl: "/pricing?payment=cancelled",
};

/**
 * Create a Stripe checkout session for upgrading to Pro
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    line_items: [
      {
        price: STRIPE_PRODUCTS.pro.priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url:
      successUrl || `${STRIPE_CONFIG.baseUrl}${STRIPE_CONFIG.successUrl}`,
    cancel_url:
      cancelUrl || `${STRIPE_CONFIG.baseUrl}${STRIPE_CONFIG.cancelUrl}`,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });

  return session;
}

/**
 * Create a Stripe customer portal session
 * Allows users to manage their subscription (cancel, update payment method, etc.)
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl?: string;
}): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${STRIPE_CONFIG.baseUrl}/dashboard/settings`,
  });

  return session;
}

/**
 * Get subscription details by ID
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error: any) {
    // SECURITY: Don't log full error (may contain Stripe keys)
    console.error("Error fetching subscription:", {
      type: error?.type,
      code: error?.code,
    });
    return null;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}

/**
 * Get customer by ID
 */
export async function getCustomer(
  customerId: string
): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return null;
    }
    return customer as Stripe.Customer;
  } catch (error: any) {
    // SECURITY: Don't log full error (may contain Stripe keys)
    console.error("Error fetching customer:", {
      type: error?.type,
      code: error?.code,
    });
    return null;
  }
}

/**
 * Helper to map Stripe subscription status to our database status
 */
export function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): "active" | "cancelled" | "expired" | "past_due" {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "canceled":
      return "cancelled";
    case "incomplete_expired":
    case "unpaid":
      return "expired";
    case "past_due":
      return "past_due";
    case "incomplete":
    case "trialing":
      return "active"; // Treat trialing/incomplete as active
    default:
      return "active";
  }
}
