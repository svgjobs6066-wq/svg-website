"use client";
import { SiteShell } from "./layout/site-shell";
import { useLanguage } from "./layout/provider";
export function Legal({
  kind,
  days,
}: {
  kind: "privacy" | "terms";
  days?: number;
}) {
  const { t, language } = useLanguage();
  const sections = kind === "privacy" ? t.privacySections : t.termsSections;
  return (
    <SiteShell>
      <main id="main" className="px-4 py-16 md:px-8 xl:px-16 xl:py-24">
        <p className="mb-5 text-xs font-bold uppercase tracking-widest text-brand-blue">
          {t[kind]}
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          {kind === "privacy" ? t.privacyTitle : t.termsTitle}
        </h1>
        <p className="mt-8 text-lg leading-8 text-brand-grey md:w-3/4">
          {kind === "privacy" ? t.privacyIntro : t.termsIntro}
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {sections.map(([title, content], i) => (
            <section
              key={title}
              className="rounded-2xl border border-ink/10 bg-white p-7"
            >
              <h2 className="mb-4 text-xl font-bold">{title}</h2>
              <p className="text-sm leading-7 text-brand-grey">
                {kind === "privacy" && i === 1 && days
                  ? language === "en"
                    ? `Resumes are deleted 10 days after being marked Reviewed, or ${days} days after submission, whichever comes first. Unmarking Reviewed cancels the review timer, but the maximum retention period still applies. Application data remains after resume deletion.`
                    : `பரிசீலிக்கப்பட்டதாகக் குறித்த 10 நாட்களில் அல்லது விண்ணப்பித்த ${days} நாட்களில், எது முதலில் வருகிறதோ அப்போது சுயவிவரம் நீக்கப்படும். குறியை நீக்கினாலும் அதிகபட்சச் சேமிப்புக் காலம் பொருந்தும். விண்ணப்ப விவரங்கள் தொடரும்.`
                  : content}
              </p>
            </section>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
