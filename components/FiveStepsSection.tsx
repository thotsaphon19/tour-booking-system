import { useTranslations } from "next-intl";
import { Mail, PenSquare, CheckCircle2, CalendarCheck, PlaneTakeoff } from "lucide-react";
import Reveal from "@/components/motion/Reveal";

const icons = [Mail, PenSquare, CheckCircle2, CalendarCheck, PlaneTakeoff];

export default function FiveStepsSection() {
  const t = useTranslations("fiveSteps");
  const steps = [1, 2, 3, 4, 5].map((n) => ({
    title: t(`step${n}Title` as "step1Title"),
    desc: t(`step${n}Desc` as "step1Desc"),
  }));

  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">{t("kicker")}</p>
        <h2 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">{t("title")}</h2>
      </Reveal>
      <div className="mt-10 grid gap-8 sm:grid-cols-3 lg:grid-cols-5">
        {steps.map((step, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={step.title} delay={i * 0.12} className="relative text-center group">
              {i < steps.length - 1 && (
                <span className="absolute left-1/2 top-7 hidden h-px w-full bg-[var(--color-border)] lg:block" />
              )}
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-jade)]/10 text-[var(--color-jade)] transition-transform duration-300 hover:scale-110 hover:bg-[var(--color-jade)]/20">
                <Icon size={22} />
              </div>
              <h3 className="mt-4 font-display font-semibold text-[var(--color-jade-dark)]">{step.title}</h3>
              <p className="mt-1 text-xs text-[var(--color-muted)]">{step.desc}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
