"use client";
import { SiteShell } from "./layout/site-shell";
import { useLanguage } from "./layout/provider";
import { Container, Eyebrow, Index } from "./ui/swiss";
import { IsoArt } from "./iso/iso-art";
export function Legal({
  kind,
}: {
  kind: "privacy" | "terms";
}) {
  const { t, language } = useLanguage();
  const sections = kind === "privacy" ? t.privacySections : t.termsSections;
  return (
    <SiteShell>
      <main id="main" className="pb-20 pt-2 md:pt-4 xl:pb-28">
        <Container>
          <div className="grid gap-2 lg:grid-cols-12">
            <div className="rounded-xs bg-paper p-7 sm:p-10 lg:col-span-8 xl:p-14">
              <Eyebrow>{t[kind]}</Eyebrow>
              <h1 className="mt-8 text-4xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-6xl">
                {kind === "privacy" ? t.privacyTitle : t.termsTitle}
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-brand-grey">
                {kind === "privacy" ? t.privacyIntro : t.termsIntro}
              </p>
            </div>
            <div className="iso-on-blue hidden items-center justify-center rounded-xs bg-brand-blue blueprint-grid p-10 lg:col-span-4 lg:flex">
              <div className="w-full max-w-60">
                <IsoArt name={kind === "privacy" ? "apply" : "finishing"} />
              </div>
            </div>
          </div>
          <div className="mt-2 grid rounded-xs border border-ink/10 md:grid-cols-3">
            {sections.map(([title, content], i) => (
              <section
                key={title}
                className="flex flex-col border-ink/10 not-last:border-b md:not-last:border-b-0 md:not-last:border-r"
              >
                <div className="flex items-center justify-between border-b border-ink/10 px-7 py-4">
                  <Index value={i + 1} className="text-brand-orange" />
                  <span aria-hidden="true" className="size-2 bg-brand-blue" />
                </div>
                <div className="p-7">
                  <h2 className="mb-4 text-xl font-semibold tracking-tight">
                    {title}
                  </h2>
                  <p className="text-sm leading-7 text-brand-grey">
                    {kind === "privacy" && i === 1
                      ? language === "en"
                        ? "Applications and resumes are kept until an administrator manually deletes them. Automatic deletion is disabled. Audit records are retained to track changes and deletions."
                        : "விண்ணப்பங்களும் சுயவிவரங்களும் நிர்வாகி கைமுறையாக நீக்கும் வரை சேமிக்கப்படும். தானியங்கி நீக்கம் இல்லை. மாற்றங்கள் மற்றும் நீக்கங்களின் பதிவுகள் பாதுகாக்கப்படும்."
                      : content}
                  </p>
                </div>
              </section>
            ))}
          </div>
        </Container>
      </main>
    </SiteShell>
  );
}
