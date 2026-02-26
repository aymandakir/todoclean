import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  GraduationCap,
  Rocket,
  Users,
  Target,
  ListChecks,
  Users2,
  Lightbulb,
  User,
  Building2,
  Globe,
  Twitter,
  UserPlus,
  Search,
  Megaphone,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";

interface StepOption {
  label: string;
  value: string;
  icon: React.ElementType;
}

const steps: {
  title: string;
  subtitle: string;
  field: string;
  options: StepOption[];
}[] = [
  {
    title: "What best describes you?",
    subtitle: "Help us tailor your experience",
    field: "role",
    options: [
      { label: "Student", value: "student", icon: GraduationCap },
      { label: "Freelancer", value: "freelancer", icon: User },
      { label: "Employee", value: "employee", icon: Briefcase },
      { label: "Founder / CEO", value: "founder", icon: Rocket },
      { label: "Manager", value: "manager", icon: Users },
      { label: "Other", value: "other", icon: Lightbulb },
    ],
  },
  {
    title: "What will you use this for?",
    subtitle: "We'll optimize your setup accordingly",
    field: "use_case",
    options: [
      { label: "Personal tasks", value: "personal", icon: ListChecks },
      { label: "Work projects", value: "work", icon: Briefcase },
      { label: "Team collaboration", value: "team", icon: Users2 },
      { label: "Goal tracking", value: "goals", icon: Target },
    ],
  },
  {
    title: "How big is your team?",
    subtitle: "This helps us suggest the right features",
    field: "team_size",
    options: [
      { label: "Just me", value: "solo", icon: User },
      { label: "2–10 people", value: "small", icon: Users },
      { label: "11–50 people", value: "medium", icon: Building2 },
      { label: "50+ people", value: "large", icon: Globe },
    ],
  },
  {
    title: "How did you find us?",
    subtitle: "We'd love to know what brought you here",
    field: "referral_source",
    options: [
      { label: "Social media", value: "social", icon: Twitter },
      { label: "Friend or colleague", value: "friend", icon: UserPlus },
      { label: "Search engine", value: "search", icon: Search },
      { label: "Advertisement", value: "ad", icon: Megaphone },
    ],
  },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const isLast = currentStep === totalSteps - 1;
  const selected = answers[step.field] || null;

  const selectOption = (value: string) => {
    if (animating) return;
    setAnswers((prev) => ({ ...prev, [step.field]: value }));
  };

  const goNext = async () => {
    if (!selected || animating) return;

    if (isLast) {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          role: answers.role,
          use_case: answers.use_case,
          team_size: answers.team_size,
          referral_source: answers.referral_source,
          onboarding_completed: true,
        } as any)
        .eq("id", user.id);

      if (error) {
        toast({
          title: "Something went wrong",
          description: error.message,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      navigate("/app", { replace: true });
      return;
    }

    setDirection("forward");
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep((s) => s + 1);
      setAnimating(false);
    }, 200);
  };

  const goBack = () => {
    if (currentStep === 0 || animating) return;
    setDirection("back");
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep((s) => s - 1);
      setAnimating(false);
    }, 200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-all duration-500"
              style={{
                background:
                  i <= currentStep
                    ? "hsl(var(--primary))"
                    : "hsl(var(--border))",
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div
          className={`transition-all duration-200 ${
            animating
              ? direction === "forward"
                ? "opacity-0 translate-x-8"
                : "opacity-0 -translate-x-8"
              : "opacity-100 translate-x-0"
          }`}
        >
          <p className="text-xs font-medium text-primary mb-2 uppercase tracking-wider">
            Step {currentStep + 1} of {totalSteps}
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {step.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">{step.subtitle}</p>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3">
            {step.options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => selectOption(opt.value)}
                  className={`group relative flex flex-col items-center gap-2.5 rounded-xl border-2 px-4 py-5 text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    isSelected
                      ? "border-primary bg-accent shadow-sm"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={goBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              currentStep === 0
                ? "text-transparent cursor-default"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={goNext}
            disabled={!selected || saving}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 shadow-lg ${
              selected
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
            }`}
          >
            {saving ? (
              "Saving..."
            ) : isLast ? (
              <>
                Get Started
                <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
