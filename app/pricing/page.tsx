'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>('free');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();

    // Check for payment status in URL
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Welcome to Pro!');
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment cancelled');
    }
  }, [searchParams]);

  const checkAuth = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setIsAuthenticated(true);

      // Get user's current plan
      const { data: profile } = await supabase
        .from('users')
        .select('plan_type')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCurrentPlan((profile as any).plan_type);
      }
    }
  };

  const handleUpgrade = async () => {
    // Check if user is authenticated
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to signup
      router.push('/signup?redirect=/pricing');
      return;
    }

    // Redirect to Request Pro Access page
    router.push('/dashboard/request-pro');
  };

  const plans = [
    {
      name: 'Free',
      subtitle: 'Hobbyist',
      price: '₹0',
      period: '/month',
      description: 'Perfect for trying out Humanify',
      features: [
        'Gemini 2.0 Flash',
        'Public (Google Trains)',
        '10 humanizations per day',
        'Up to 1,000 characters',
        'History: Last 7 days',
        'Claude: ❌ Not available',
      ],
      cta: 'Current Plan',
      highlighted: false,
      plan: 'free' as const,
    },
    {
      name: 'Pro',
      subtitle: 'Power User',
      price: '₹999',
      period: '/month',
      description: 'For serious content creators',
      features: [
        'Gemini 2.0 Flash (Private)',
        '🔒 Private (Zero Training)',
        'Unlimited humanizations',
        'Up to 10,000 characters',
        'History: Unlimited',
        'Claude 3.5: ✅ Supported (Bring Your Key)',
      ],
      cta: 'Request Pro Access',
      highlighted: true,
      plan: 'pro' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.highlighted
                  ? 'border-primary shadow-lg shadow-primary/20'
                  : 'border-border/50'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-accent">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  {plan.plan === 'pro' && <Crown className="w-6 h-6 text-primary" />}
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {plan.plan === 'free' ? (
                  currentPlan === 'free' ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      Downgrade Available
                    </Button>
                  )
                ) : (
                  <Button
                    variant="default"
                    className="w-full gap-2"
                    onClick={handleUpgrade}
                    disabled={isLoading || currentPlan === 'pro'}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : currentPlan === 'pro' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {plan.cta}
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can cancel your Pro subscription at any time. You'll continue to have Pro access until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does Pro access work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pro access is currently available through a request process. Submit your request, tell us why you need Pro, and we'll review and contact you within 24-48 hours.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens after I submit a request?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We'll review your request and reach out to you directly. Once approved, you'll get immediate Pro access with all unlimited features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
}
