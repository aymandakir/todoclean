import { useNavigate } from "react-router-dom";
import { CheckCircle2, Zap, Shield, Smartphone, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import Logo from "@/components/Logo";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Add, reorder, and complete tasks in milliseconds. No lag, no waiting.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your data is encrypted and only accessible to you. Always.",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    description: "Seamless experience on desktop, tablet, and mobile. Your tasks follow you.",
  },
];

const revealClasses = (visible: boolean, delay = "") =>
  `transition-all duration-700 ease-out ${delay} ${
    visible
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-8"
  }`;

const Landing = () => {
  const navigate = useNavigate();

  const hero = useScrollReveal({ threshold: 0.1 });
  const mockup = useScrollReveal();
  const featuresSection = useScrollReveal();
  const feature0 = useScrollReveal();
  const feature1 = useScrollReveal();
  const feature2 = useScrollReveal();
  const cta = useScrollReveal();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" itemScope itemType="https://schema.org/WebApplication">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <Logo />
        <button
          onClick={() => navigate("/auth")}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <section
        ref={hero.ref}
        className="flex flex-col items-center text-center px-6 pt-20 pb-24 max-w-3xl mx-auto"
      >
        <div
          className={revealClasses(hero.isVisible)}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            Simple. Focused. Effective.
          </div>
        </div>

        <h1
          className={`text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.08] ${revealClasses(hero.isVisible, "delay-100")}`}
        >
          Get things done,
          <br />
          <span className="text-primary">beautifully.</span>
        </h1>

        <p
          className={`mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed ${revealClasses(hero.isVisible, "delay-200")}`}
        >
          A minimalist todo app that gets out of your way. No clutter, no distractions — just you and your tasks.
        </p>

        <div
          className={`flex gap-3 mt-10 ${revealClasses(hero.isVisible, "delay-300")}`}
        >
          <button
            onClick={() => navigate("/auth")}
            className="group flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Start for Free
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* Preview mockup */}
      <section
        ref={mockup.ref}
        className={`px-6 max-w-2xl mx-auto pb-24 ${revealClasses(mockup.isVisible)}`}
      >
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-3">
            {["Design landing page", "Write documentation", "Ship v1.0"].map(
              (task, i) => (
                <div
                  key={task}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3"
                >
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      i === 0
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {i === 0 && (
                      <svg viewBox="0 0 16 16" className="text-primary-foreground">
                        <path
                          d="M5 8l2 2 4-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      i === 0
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-4xl mx-auto" aria-labelledby="features-heading">
        <div ref={featuresSection.ref}>
          <h2
            id="features-heading"
            className={`text-2xl font-bold text-foreground text-center mb-12 ${revealClasses(featuresSection.isVisible)}`}
          >
            Everything you need, nothing you don't.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const refs = [feature0, feature1, feature2];
            const r = refs[i];
            return (
              <div
                key={f.title}
                ref={r.ref}
                className={`rounded-xl border border-border bg-card p-6 text-center ${revealClasses(r.isVisible, i === 1 ? "delay-100" : i === 2 ? "delay-200" : "")}`}
              >
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <f.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section
        ref={cta.ref}
        className={`px-6 pb-20 max-w-2xl mx-auto text-center ${revealClasses(cta.isVisible)}`}
      >
        <div className="rounded-2xl border border-border bg-card p-10">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Ready to get organized?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Join and start managing your tasks the clean way.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Get Started
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} todo. Built with care.
      </footer>
    </div>
  );
};

export default Landing;
