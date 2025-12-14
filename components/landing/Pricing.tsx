import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Get started with the basics",
      features: [
        "5 rewrites/day",
        "All tones",
        "Up to 1,000 characters",
      ],
      buttonText: "Try Free",
      buttonVariant: "outline" as const,
      highlighted: false,
    },
    {
      name: "Pro",
      price: "₹999",
      period: "/month",
      description: "For power users and professionals",
      features: [
        "Unlimited rewrites",
        "Priority fast mode",
        "AI-likeness score",
        "Early access to new features",
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "hero" as const,
      highlighted: true,
      badge: "Best Value",
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Simple, <span className="text-gradient">Affordable</span> Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more power.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border ${
                plan.highlighted
                  ? "border-primary bg-card shadow-elegant"
                  : "border-border bg-card"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-extrabold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="text-primary flex-shrink-0" size={18} />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="w-full">
                <Button
                  variant={plan.buttonVariant}
                  size="lg"
                  className="w-full"
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
