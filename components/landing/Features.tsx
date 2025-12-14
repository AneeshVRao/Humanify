import { Sparkles, Theater, Zap, Lock, BarChart3 } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Human-Level Rewriting",
      description: "Rewrites robotic or repetitive AI text into smooth, natural prose that actually feels written by a person.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Theater,
      title: "Multiple Tones",
      description: "Choose from Casual, Professional, Academic, or Neutral tones — write the way you want.",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized model pipelines deliver rewrites in under two seconds.",
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      icon: Lock,
      title: "Private & Secure",
      description: "Your text is never stored or used for model training.",
      color: "bg-green-500/10 text-green-600",
    },
    {
      icon: BarChart3,
      title: "AI-Likeness Score",
      description: "Get an instant score showing how \"human\" your writing sounds.",
      color: "bg-blue-500/10 text-blue-600",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Sound Natural</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make your writing feel authentically human.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
