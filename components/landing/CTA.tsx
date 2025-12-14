import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-primary opacity-5" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles size={16} />
            <span>Start humanizing content today</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
            Ready to Create{" "}
            <span className="text-gradient">Human-Quality Content?</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join 50,000+ content creators who trust Humanize to transform their AI-generated text into authentic, undetectable content.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="hero" size="xl">
                Get Started Free
                <ArrowRight size={20} />
              </Button>
            </Link>
            <a href="mailto:contact@humanify.com">
              <Button variant="glass" size="xl">
                Schedule Demo
              </Button>
            </a>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 5,000 free words • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
