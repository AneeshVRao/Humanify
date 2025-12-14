/**
 * POST /api/stripe/webhook
 *
 * Stripe webhook handler
 * Processes Stripe events (payments, subscriptions, etc.)
 *
 * Payment Integration Specialist: Event-driven subscription management
 * - Verifies webhook signature
 * - Handles checkout.session.completed
 * - Handles customer.subscription.* events
 * - Updates database accordingly
 */

import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, mapSubscriptionStatus } from '@/lib/stripe';
import { createAdminSupabaseClient } from '@/lib/supabase/client';

// Configure route for webhook handling
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function POST_Handler(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  let event: Stripe.Event;

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    // SECURITY: Don't log full error (may contain webhook secret)
    console.error('Webhook signature verification failed:', {
      type: error?.type,
      message: error?.message,
    });
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  // Handle the event
  try {
    switch (event.type) {
      // Checkout session completed - first payment successful
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== 'subscription') {
          break;
        }

        const userId = session.metadata?.userId || session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          console.error('No userId in checkout session metadata');
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

        // Update user to Pro plan
        const { error: updateError } = await (supabase
          .from('users') as any)
          .update({
            plan_type: 'pro' as const,
            subscription_status: 'active',
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user to Pro:', updateError);
          break;
        }

        // Create subscription record
        const { error: subscriptionError } = await (supabase
          .from('subscriptions') as any)
          .insert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: subscription.items.data[0].price.id,
            plan_type: 'pro' as const,
            status: 'active' as const,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end ?? false,
          });

        if (subscriptionError) {
          console.error('Error creating subscription record:', subscriptionError);
        }

        console.log(`User ${userId} upgraded to Pro`);
        break;
      }

      // Subscription updated
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        const status = mapSubscriptionStatus(subscription.status);

        // Update subscription record
        const { error: updateError } = await (supabase
          .from('subscriptions') as any)
          .update({
            status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end ?? false,
            cancelled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          break;
        }

        // Update user status
        await (supabase
          .from('users') as any)
          .update({
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        console.log(`Subscription ${subscription.id} updated to ${status}`);
        break;
      }

      // Subscription deleted (cancelled and period ended)
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        // Downgrade user to Free plan
        const { error: downgradeError } = await (supabase
          .from('users') as any)
          .update({
            plan_type: 'free' as const,
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (downgradeError) {
          console.error('Error downgrading user:', downgradeError);
          break;
        }

        // Update subscription status
        await (supabase
          .from('subscriptions') as any)
          .update({
            status: 'cancelled' as const,
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        console.log(`User ${userId} downgraded to Free`);
        break;
      }

      // Payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // @ts-ignore - Stripe type issue
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        // Update user status to past_due
        await (supabase
          .from('users') as any)
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        console.log(`Payment failed for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    // SECURITY: Don't log full error (may contain sensitive data)
    console.error('Error processing webhook:', {
      name: error?.name,
      message: error?.message,
    });
    return new Response('Webhook processing failed', { status: 500 });
  }
}

export const POST = POST_Handler;
