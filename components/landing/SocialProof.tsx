import { Star } from "lucide-react";

const SocialProof = () => {
  const testimonials = [
    {
      quote: "Finally, a tool that doesn't SOUND like AI.",
      author: "Freelance Writer",
    },
    {
      quote: "Perfect for making my essays feel genuine.",
      author: "College Student",
    },
    {
      quote: "Game-changer for my content workflow.",
      author: "Content Creator",
    },
  ];

  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        {/* Header */}
        <p className="text-center text-muted-foreground mb-8 text-lg">
          Trusted by writers, students, and content creators worldwide.
        </p>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="fill-primary text-primary" size={24} />
          ))}
          <span className="ml-2 text-foreground font-semibold">4.9/5</span>
          <span className="text-muted-foreground ml-1">from 2,000+ reviews</span>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="p-6 rounded-xl bg-background border border-border text-center"
            >
              <p className="text-foreground italic mb-4">"{testimonial.quote}"</p>
              <p className="text-sm text-muted-foreground font-medium">
                — {testimonial.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
