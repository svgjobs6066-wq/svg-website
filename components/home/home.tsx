"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  Cog,
  ScanLine,
  Layers3,
  Wrench,
  BriefcaseBusiness,
  MapPin,
  Plus,
  Minus,
  Check,
  BookOpen,
  GraduationCap,
  Award,
} from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Observer } from "gsap/Observer";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useLanguage } from "@/components/layout/provider";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { type Job } from "@/lib/jobs";
import { Testimonials } from "@/components/home/testimonials";
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Observer, DrawSVGPlugin);
const icons: Record<string, typeof Cog> = {
  Machining: Cog,
  Fabrication: ScanLine,
  Assembly: Wrench,
  Finishing: Layers3,
  Office: BriefcaseBusiness,
};
export function JobCard({
  job,
  index = 0,
  onSelect,
  selected,
}: {
  job: Job;
  index?: number;
  onSelect?: () => void;
  selected?: boolean;
}) {
  const { t } = useLanguage();
  const Icon = icons[job.department] || BriefcaseBusiness;
  return (
    <article
      data-job-card
      className={`group flex h-full flex-col rounded-2xl border p-6 transition-colors hover:border-brand-blue md:p-7 ${selected ? "border-brand-blue bg-blue-50" : "border-ink/10 bg-white"}`}
    >
      <div className="mb-8 flex items-center justify-between gap-2">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-paper text-brand-blue">
          <Icon strokeWidth={1.5} />
        </span>
        <span className="text-[11px] font-semibold tracking-wider text-brand-grey">
          {String(index + 1).padStart(2, "0")} /{" "}
          {t.dept[job.department] || job.department}
        </span>
      </div>
      <h3 className="text-xl font-bold leading-snug tracking-tight">
        {t.jobTitles[job.title] || job.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-brand-grey">
        {t.highlights[job.highlight] || job.highlight}
      </p>
      {job.eligibility && (
        <p className="mt-3 text-sm text-brand-grey">{job.eligibility}</p>
      )}
      <div className="mb-6 mt-5 flex items-center gap-2 text-xs text-brand-grey">
        <MapPin size={13} />
        {job.location || t.locationPending}
        {job.job_type ? ` · ${job.job_type}` : ""}
      </div>
      <div className="mt-auto border-t border-ink/10 pt-4">
        {onSelect ? (
          <button
            onClick={onSelect}
            className="flex min-h-11 w-full items-center justify-between text-sm font-bold text-brand-blue"
          >
            {selected ? <Check size={18} /> : t.select}
            <ArrowUpRight size={20} />
          </button>
        ) : (
          <Link
            className="flex min-h-11 items-center justify-between text-sm font-bold text-brand-blue decoration-brand-orange underline-offset-8 group-hover:underline"
            href={`/careers?job=${job.slug}`}
          >
            {t.apply}
            <ArrowUpRight size={20} />
          </Link>
        )}
      </div>
    </article>
  );
}
export function Faq({ mini = false }: { mini?: boolean }) {
  const { t } = useLanguage();
  const [active, setActive] = useState("");
  return (
    <section
      id="faq"
      className="grid scroll-mt-6 gap-10 bg-white px-4 py-20 md:grid-cols-[0.9fr_1.1fr] md:px-8 xl:px-16 xl:py-28"
    >
      <div>
        <p className="mb-5 text-xs font-bold tracking-[0.2em] text-brand-blue">
          {t.faq}
        </p>
        <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          {t.questions}
          <br />
          <span className="text-brand-grey">{t.answers}</span>
        </h2>
      </div>
      <Accordion.Root
        type="single"
        collapsible
        value={active}
        onValueChange={setActive}
      >
        {t.faqItems.slice(0, mini ? 3 : 6).map(([q, a], i) => (
          <Accordion.Item
            key={i}
            value={String(i)}
            className="border-b border-ink/15"
          >
            <Accordion.Header>
              <Accordion.Trigger className="flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left text-sm font-semibold md:text-base">
                {q}
                <span className="shrink-0 text-brand-blue">
                  {active === String(i) ? (
                    <Minus size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="pb-6 pr-8 text-sm leading-7 text-brand-grey">
              {a}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
export function Home({ jobs }: { jobs: Job[] }) {
  const { t, language } = useLanguage();
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const marquee = useRef<gsap.core.Tween | null>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create("[data-headline]", {
          type: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              y: 36,
              opacity: 0,
              stagger: 0.12,
              duration: 0.8,
              ease: "power3.out",
            }),
        });
        gsap.to("[data-gear]", {
          rotation: 360,
          duration: 80,
          repeat: -1,
          ease: "none",
        });
        gsap.to("[data-chip]", {
          y: -9,
          duration: 2.5,
          yoyo: true,
          repeat: -1,
          stagger: 0.4,
          ease: "sine.inOut",
        });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) =>
          gsap.from(el, {
            y: 28,
            opacity: 0,
            duration: 0.7,
            scrollTrigger: { trigger: el, start: "top 93%", once: true },
          }),
        );
        gsap.from("[data-qualification]", {
          scale: 0.85,
          opacity: 0,
          stagger: 0.08,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: "#qualifications",
            start: "top 85%",
            once: true,
          },
        });
        gsap.from("[data-connector]", {
          drawSVG: "0%",
          scrollTrigger: {
            trigger: "#how",
            start: "top 80%",
            end: "bottom 65%",
            scrub: 1,
          },
        });
        marquee.current = gsap.to("[data-marquee]", {
          xPercent: -50,
          duration: 55,
          repeat: -1,
          ease: "none",
        });
        const observer = Observer.create({
          target: window,
          type: "scroll",
          onDown: () => {
            if (marquee.current && !marquee.current.paused())
              gsap.to(marquee.current, { timeScale: 1.4, duration: 0.4 });
          },
          onUp: () => {
            if (marquee.current && !marquee.current.paused())
              gsap.to(marquee.current, { timeScale: -1, duration: 0.4 });
          },
        });
        return () => {
          split.revert();
          observer.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [language] },
  );
  return (
    <SiteShell>
      <div ref={root}>
        <main id="main">
          <section className="relative grid min-h-[650px] overflow-hidden px-4 pb-10 pt-14 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:px-8 md:pt-16 xl:min-h-[750px] xl:px-16">
            <div className="relative z-10 flex flex-col items-start">
              <p className="mb-7 flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-brand-grey md:text-xs">
                <span className="size-2 rounded-full bg-brand-green" />
                {t.eyebrow}
              </p>
              <h1
                data-headline
                className={`font-extrabold leading-[1.07] tracking-[-0.065em] ${language === "ta" ? "text-4xl lg:text-6xl" : "text-[clamp(3.6rem,6.7vw,7.6rem)]"}`}
              >
                {t.hero1}
                <br />
                {t.hero2}
                <br />
                <span className="text-brand-blue">{t.hero3}</span>
                <span className="text-brand-orange">↗</span>
              </h1>
              <p className="mt-7 text-base leading-7 text-brand-grey md:w-5/6 xl:text-lg">
                {t.intro}
              </p>
              <Button asChild className="mt-8 gap-8 px-7 py-4">
                <Link href="/careers">
                  {t.viewCareers}
                  <ArrowUpRight size={20} />
                </Link>
              </Button>
              <p className="mt-5 text-xs text-brand-grey">{t.heroNote}</p>
              <a
                href="#qualifications"
                className="mt-12 flex min-h-11 items-center gap-3 text-[10px] font-semibold tracking-[0.15em]"
              >
                <span className="flex size-8 items-center justify-center rounded-full border border-ink/20">
                  <ArrowDown size={14} />
                </span>
                {t.scroll}
              </a>
            </div>
            <div className="relative mt-12 min-h-[390px] md:mt-0">
              <div className="absolute inset-x-0 top-0 h-[88%] rounded-[32px] bg-[#e5edf1] md:top-5">
                <div className="absolute left-7 top-7 flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-ink/60">
                  <span className="size-1.5 rounded-full bg-brand-orange" /> SVG
                  / CAREERS
                </div>
                <div className="absolute inset-x-8 top-16 flex items-center justify-center">
                  <svg
                    data-gear
                    aria-hidden="true"
                    viewBox="0 0 400 400"
                    className="w-full overflow-visible text-brand-blue"
                  >
                    <g fill="currentColor">
                      {Array.from({ length: 12 }, (_, i) => (
                        <rect
                          key={i}
                          x="172"
                          y="12"
                          width="56"
                          height="96"
                          rx="10"
                          transform={`rotate(${i * 30} 200 200)`}
                        />
                      ))}
                      <circle cx="200" cy="200" r="145" />
                    </g>
                    <circle cx="200" cy="200" r="86" fill="#e5edf1" />
                    <circle cx="200" cy="200" r="58" fill="#f58220" />
                    <path
                      d="M175 219l47-47m-37 0h37v37"
                      fill="none"
                      stroke="#1e2a36"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div
                  data-chip
                  className="absolute -left-2 top-[38%] flex items-center gap-3 rounded-full border border-ink/10 bg-white px-5 py-3 text-xs font-semibold md:-left-6"
                >
                  <Cog size={18} className="text-brand-blue" />
                  {t.dept.Machining}
                </div>
                <div
                  data-chip
                  className="absolute -right-1 top-[61%] flex items-center gap-3 rounded-full border border-ink/10 bg-white px-5 py-3 text-xs font-semibold"
                >
                  <Wrench size={18} className="text-brand-orange" />
                  {t.dept.Assembly}
                </div>
              </div>
              <div className="absolute bottom-0 left-6 right-6 flex items-center justify-between gap-3 rounded-2xl bg-brand-orange p-6 xl:p-8">
                <div>
                  <p className="text-lg font-bold leading-tight xl:text-2xl">
                    {t.craft}
                    <br />
                    {t.people}
                  </p>
                  <p className="mt-3 text-xs text-ink/80">{t.craftNote}</p>
                </div>
                <ArrowUpRight
                  size={38}
                  strokeWidth={1.5}
                  className="shrink-0"
                />
              </div>
            </div>
          </section>
          <div className="relative mt-8 overflow-hidden border-y border-ink/10 bg-white py-5">
            <div data-marquee className="flex w-max items-center">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex items-center"
                >
                  {jobs.map((job) => (
                    <span
                      key={job.slug}
                      className="flex items-center gap-8 whitespace-nowrap px-4 text-xs font-semibold uppercase tracking-wider text-brand-grey"
                    >
                      {t.jobTitles[job.title] || job.title}
                      <span className="text-brand-orange">✳</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const next = !paused;
                setPaused(next);
                marquee.current?.paused(next);
              }}
              aria-label={paused ? "Play role marquee" : "Pause role marquee"}
              className="absolute right-0 top-0 h-full min-w-11 border-l bg-white px-4 text-xs"
            >
              {paused ? "▶" : "Ⅱ"}
            </button>
          </div>
          <section
            id="qualifications"
            aria-labelledby="qualifications-heading"
            className="scroll-mt-6 px-4 py-16 md:px-8 xl:px-16 xl:py-24"
          >
            <div className="grid overflow-hidden rounded-[2rem] border border-ink/10 bg-white lg:grid-cols-[0.9fr_1.1fr]">
              <div
                data-reveal
                className="relative isolate flex flex-col items-start overflow-hidden bg-ink p-7 text-white sm:p-10 xl:p-12"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-28 -left-28 -z-10 size-80 rounded-full border-[45px] border-white/5"
                />
                <span className="mb-10 flex size-14 items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-brand-orange">
                  <GraduationCap
                    size={30}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
                <p className="mb-5 text-[10px] font-bold tracking-[0.2em] text-brand-orange sm:text-xs">
                  {t.available}
                </p>
                <h2
                  id="qualifications-heading"
                  className="text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl xl:text-5xl"
                >
                  {t.allQualifications}
                  <br />
                  <span className="text-brand-orange">{t.place}</span>
                </h2>
                <p className="mb-9 mt-6 max-w-sm text-sm leading-7 text-white/75">
                  {t.qualificationNote}
                </p>
                <Link
                  href="/careers"
                  className="mt-auto inline-flex min-h-12 items-center gap-8 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-white"
                >
                  {t.seeOpenings}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
              <div className="p-5 sm:p-8 xl:p-10">
                <div className="mb-6 flex items-center justify-between gap-4 border-b border-ink/10 pb-5">
                  <p className="text-sm font-bold">{t.qualifications}</p>
                  <span className="text-[10px] font-semibold tracking-widest text-brand-grey">
                    SVG / CAREERS
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {t.qualificationsList.map((q, i) => {
                    const Icon =
                      [
                        BookOpen,
                        BookOpen,
                        Wrench,
                        Award,
                        GraduationCap,
                        Layers3,
                      ][i] || Layers3;
                    return (
                      <div
                        data-qualification
                        key={q}
                        className={`group relative flex min-h-36 flex-col items-start justify-between rounded-2xl border p-5 motion-safe:transition-colors sm:min-h-40 ${i === 2 ? "border-brand-blue bg-brand-blue text-white" : "border-ink/5 bg-paper hover:border-brand-blue/30 hover:bg-blue-50"}`}
                      >
                        <div className="flex w-full items-center justify-between gap-3">
                          <Icon
                            size={25}
                            strokeWidth={1.5}
                            aria-hidden="true"
                            className={
                              i === 2 ? "text-white" : "text-brand-blue"
                            }
                          />
                          <span
                            aria-hidden="true"
                            className={`text-[10px] font-semibold ${i === 2 ? "text-white/65" : "text-ink/40"}`}
                          >
                            0{i + 1}
                          </span>
                        </div>
                        <h3 className="mt-6 text-lg font-bold leading-snug tracking-tight sm:text-xl">
                          {q}
                        </h3>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
          <section
            id="roles"
            className="scroll-mt-6 border-t border-ink/10 px-4 py-20 md:px-8 xl:px-16"
          >
            <div
              data-reveal
              className="mb-10 flex flex-wrap items-end justify-between gap-6"
            >
              <div>
                <p className="mb-4 text-xs font-bold tracking-[0.2em] text-brand-blue">
                  {t.roles}
                </p>
                <h2 className="text-3xl font-bold tracking-tight xl:text-5xl">
                  {t.openings}
                </h2>
                <p className="mt-5 text-sm text-brand-grey">{t.openingsNote}</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/careers">
                  {t.allRoles}
                  <ArrowUpRight size={18} />
                </Link>
              </Button>
            </div>
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-4">
              {jobs.map((job, i) => (
                <div
                  data-reveal
                  key={job.slug}
                  className="w-[85%] shrink-0 snap-start md:w-auto"
                >
                  <JobCard job={job} index={i} />
                </div>
              ))}
            </div>
          </section>
          <section
            id="how"
            className="relative overflow-hidden bg-ink px-4 py-20 text-white md:px-8 xl:px-16 xl:py-28"
          >
            <p className="mb-5 text-xs font-bold tracking-[0.2em] text-brand-orange">
              {t.howLabel}
            </p>
            <h2 className="text-4xl font-bold tracking-tight xl:text-5xl">
              {t.how}
            </h2>
            <svg
              className="pointer-events-none absolute left-[10%] top-[49%] hidden w-4/5 md:block"
              viewBox="0 0 1000 80"
              aria-hidden="true"
            >
              <path
                data-connector
                d="M0 40 H1000"
                fill="none"
                stroke="#f58220"
                strokeWidth="2"
                strokeDasharray="4 8"
              />
            </svg>
            <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-16">
              {t.steps.map((s, i) => (
                <div data-reveal key={s}>
                  <span
                    className={`mb-7 flex size-14 items-center justify-center rounded-full text-lg font-bold ${i === 1 ? "bg-brand-orange text-ink" : "border border-white/30 bg-ink"}`}
                  >
                    0{i + 1}
                  </span>
                  <h3 className="text-xl font-semibold">{s}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/60">
                    {t.stepNotes[i]}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <Testimonials />
          <Faq />
          <section className="flex flex-col items-start justify-between gap-8 bg-brand-blue px-4 py-16 text-white md:flex-row md:items-center md:px-8 xl:px-16 xl:py-20">
            <div>
              <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-6xl">
                {t.ready}
                <br />
                {t.starts}
              </h2>
              <p className="mt-5 text-sm text-white/80">{t.readyNote}</p>
            </div>
            <Button asChild variant="orange" className="gap-10 px-8 py-5">
              <Link href="/careers">
                {t.apply}
                <ArrowUpRight size={23} />
              </Link>
            </Button>
          </section>
        </main>
      </div>
    </SiteShell>
  );
}
