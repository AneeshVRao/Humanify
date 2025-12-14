import { 
  GraduationCap, 
  PenTool, 
  Megaphone,
  Briefcase,
  Building2
} from "lucide-react";

const UseCases = () => {
  const useCases = [
    {
      icon: GraduationCap,
      title: "Students",
      description: "Make essays sound like you.",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: PenTool,
      title: "Bloggers",
      description: "Fix stiff or generic AI paragraphs.",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      icon: Megaphone,
      title: "Social Media Managers",
      description: "Write engaging captions quickly.",
      color: "bg-pink-500/10 text-pink-600",
    },
    {
      icon: Briefcase,
      title: "Freelancers",
      description: "Deliver natural-flowing content your clients love.",
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      icon: Building2,
      title: "Professionals",
      description: "Clean, concise emails in seconds.",
      color: "bg-green-500/10 text-green-600",
    },
  ];

  return (
    <section id="use-cases" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Who Is This <span className="text-gradient">For?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're a student or a professional, we've got you covered.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center"
            >
              <div className={`w-14 h-14 rounded-xl ${useCase.color} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                <useCase.icon size={28} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {useCase.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
