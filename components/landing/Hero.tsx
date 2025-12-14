import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const Hero = () => {
  const benefits = [
    "Human-sounding rewrites",
    "Multiple tones",
    "Fast, 2-second outputs",
    "Works with essays, blogs, emails, anything",
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden gradient-hero">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight animate-fade-in">
            Write Like a Human —{" "}
            <span className="text-gradient">Instantly.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Transform AI-generated text into natural, authentic writing that sounds 100% human. Perfect for students, bloggers, and professionals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link href="/signup">
              <Button variant="hero" size="xl">
                Humanize My Text
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="xl">
                Try Free (No Signup)
              </Button>
            </Link>
          </div>

          {/* Benefits Summary */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-muted-foreground">
                <Check className="text-primary" size={18} />
                <span className="text-sm md:text-base">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
