"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  Wrench,
  MapPin,
  Plus,
  Minus,
  Check,
  BookOpen,
  GraduationCap,
  Award,
  Layers3,
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
import { Container, Eyebrow, Index } from "@/components/ui/swiss";
import { IsoArt } from "@/components/iso/iso-art";
import { useIsoDraw } from "@/components/iso/use-iso-draw";
import type { SceneName } from "@/components/iso/scenes";
import { type Job } from "@/lib/jobs";
import { cn } from "@/lib/utils";
import { Testimonials } from "@/components/home/testimonials";
import { Affiliates } from "@/components/home/affiliates";
import { WhatWeDo } from "@/components/home/what-we-do";
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Observer, DrawSVGPlugin);

const departmentArt: Record<string, SceneName> = {
  Machining: "machining",
  Fabrication: "fabrication",
  Assembly: "assembly",
  Finishing: "finishing",
  Office: "office",
};
const qualificationIcons = [
  BookOpen,
  BookOpen,
  Wrench,
  Award,
  GraduationCap,
  Layers3,
];
const journeyArt: SceneName[] = ["apply", "call", "join"];

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
  const action =
    "flex min-h-11 w-full items-center justify-between text-sm font-semibold text-brand-blue after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";
  return (
    <article
      data-job-card
      className={cn(
        "group relative flex h-full flex-col rounded-xs border p-4 transition-[border-color,background-color] duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-orange",
        selected
          ? "iso-on-soft border-brand-blue bg-brand-blue-soft"
          : "iso-on-white border-ink/10 bg-white hover:border-brand-blue/50",
      )}
    >
      <div className="mb-3 flex min-h-12 items-start justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-brand-grey">
        <span>
          <span className="text-brand-orange">
            {String(index + 1).padStart(2, "0")}
          </span>{" "}
          / {t.dept[job.department] || job.department}
        </span>
        <IsoArt
          name={departmentArt[job.department] ?? "office"}
          className="h-12 w-12 shrink-0"
        />
      </div>
      <h3 className="text-base font-semibold leading-snug tracking-tight md:text-lg">
        {t.jobTitles[job.title] || job.title}
      </h3>
      <p className="mt-1.5 text-sm leading-5 text-brand-grey">
        {t.highlights[job.highlight] || job.highlight}
      </p>
      {job.eligibility && (
        <p className="mt-2 text-sm text-brand-grey">{job.eligibility}</p>
      )}
      <div className="mb-3 mt-3 flex items-center gap-2 font-mono text-[11px] text-brand-grey">
        <MapPin size={13} aria-hidden="true" />
        {job.location || t.locationPending}
        {job.job_type ? ` · ${job.job_type}` : ""}
      </div>
      <div className="mt-auto border-t border-ink/10 pt-1">
        {onSelect ? (
          <button onClick={onSelect} className={action}>
            {selected ? <Check size={18} /> : t.select}
            <ArrowSquare active={selected} />
          </button>
        ) : (
          <Link className={action} href={`/jobs?job=${job.slug}`}>
            {t.apply}
            <ArrowSquare />
          </Link>
        )}
      </div>
    </article>
  );
}

function ArrowSquare({ active = false }: { active?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 items-center justify-center rounded-xs transition-colors duration-200",
        active
          ? "bg-brand-orange text-ink"
          : "bg-paper text-brand-blue group-hover:bg-brand-orange group-hover:text-ink",
      )}
    >
      <ArrowUpRight size={18} />
    </span>
  );
}

export function Faq({ mini = false }: { mini?: boolean }) {
  const { t } = useLanguage();
  const [active, setActive] = useState("");
  return (
    <section
      id="faq"
      className={cn(
        "scroll-mt-24 py-20 xl:py-28",
        mini ? "bg-white" : "bg-paper",
      )}
    >
      <Container className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow>{t.faq}</Eyebrow>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl">
            {t.questions}
            <br />
            <span className="text-brand-grey">{t.answers}</span>
          </h2>
          <div
            className={cn(
              "mt-14 hidden w-full max-w-60 lg:block",
              mini ? "iso-on-white" : "iso-on-paper",
            )}
          >
            <IsoArt name="cubes" />
          </div>
        </div>
        <Accordion.Root
          type="single"
          collapsible
          value={active}
          onValueChange={setActive}
          className="border-t border-ink/15 lg:col-span-7"
        >
          {t.faqItems.slice(0, mini ? 3 : 6).map(([q, a], i) => (
            <Accordion.Item
              key={i}
              value={String(i)}
              className="border-b border-ink/15"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group grid min-h-18 w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-5 text-left text-base font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange md:text-lg">
                  <Index value={i + 1} className="text-brand-orange" />
                  {q}
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xs border transition-colors duration-200",
                      active === String(i)
                        ? "border-brand-blue bg-brand-blue text-white"
                        : "border-ink/15 text-brand-blue group-hover:border-brand-blue",
                    )}
                  >
                    {active === String(i) ? (
                      <Minus size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="pb-6 pl-14 pr-12 text-sm leading-7 text-brand-grey">
                {a}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Container>
    </section>
  );
}

export function Home({ jobs }: { jobs: Job[] }) {
  const { t, language } = useLanguage();
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const marquee = useRef<gsap.core.Tween | null>(null);
  useIsoDraw(root);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create("[data-headline]", {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 100,
              stagger: 0.1,
              duration: 0.9,
              ease: "power4.out",
            }),
        });
        gsap.to("[data-chip]", {
          y: -6,
          duration: 2.6,
          yoyo: true,
          repeat: -1,
          stagger: 0.5,
          ease: "sine.inOut",
        });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) =>
          gsap.from(el, {
            y: 24,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 93%", once: true },
          }),
        );
        gsap.from("[data-qualification]", {
          x: -16,
          opacity: 0,
          stagger: 0.06,
          duration: 0.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#qualifications",
            start: "top 80%",
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
          <div className="relative overflow-hidden border-y border-ink/10 bg-white py-4">
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
                      className="flex items-center gap-8 whitespace-nowrap px-4 font-mono text-xs uppercase tracking-wider text-brand-grey"
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
              className="absolute right-0 top-0 h-full min-w-12 border-l border-ink/10 bg-white px-4 font-mono text-xs transition-colors hover:text-brand-blue"
            >
              {paused ? "▶" : "Ⅱ"}
            </button>
          </div>

          {/* Hero: Okean-style bento of blue, orange and paper tiles */}
          <section className="pt-2 md:pt-4">
            <Container className="grid grid-cols-2 gap-2 lg:grid-cols-12">
              <div className="iso-on-blue relative isolate col-span-2 flex flex-col overflow-hidden rounded-xs bg-brand-blue blueprint-grid p-6 text-white sm:p-10 lg:col-span-8 lg:row-span-2 lg:min-h-[640px] xl:min-h-[700px] xl:p-14">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Eyebrow tone="light">{t.eyebrow}</Eyebrow>
                  <span className="brand-intro inline-flex flex-col items-start font-mono text-[11px] font-semibold tracking-[0.14em] text-white sm:items-end sm:text-xs">
                    {t.company}
                    <span className="brand-intro-rule mt-2 block h-0.5 w-8 origin-right bg-brand-orange" />
                  </span>
                </div>
                <h1
                  key={language}
                  data-headline
                  className={cn(
                    "mt-10 font-semibold tracking-[-0.045em] lg:mt-14",
                    language === "ta"
                      ? "text-4xl lg:text-6xl"
                      : "text-[clamp(3.2rem,5.6vw,6.4rem)]",
                    language === "ta" ? "leading-tight" : "leading-[0.95]",
                  )}
                >
                  {t.hero1}
                  <br />
                  {t.hero2}
                  <br />
                  {t.hero3}
                  <span
                    aria-hidden="true"
                    className="ml-[0.35em] inline-flex size-[1.55em] -translate-y-[0.15em] items-center justify-center rounded-full bg-brand-orange align-middle text-[0.4em] font-medium text-white"
                  >
                    ↗
                  </span>
                </h1>
                <p className="relative mt-7 max-w-sm text-base leading-7 text-white/80 xl:text-lg xl:leading-8">
                  {t.intro}
                </p>
                <p className="relative z-10 mt-7 text-sm text-white/75">
                  {language === "ta"
                    ? "2015 முதல் செயல்படுகிறோம்"
                    : "Established in 2015"}
                </p>
                <div className="relative mt-9 flex flex-col items-start gap-4">
                  <Button asChild variant="light" className="min-w-56">
                    <Link href="/jobs">
                      {t.viewCareers}
                      <ArrowUpRight size={20} />
                    </Link>
                  </Button>
                  <p className="max-w-xs text-xs leading-5 text-white/65">
                    {t.heroNote}
                  </p>
                </div>
                <div className="pointer-events-none relative -mx-4 mt-10 sm:-mx-6 lg:absolute lg:-bottom-6 lg:-right-4 lg:mx-0 lg:mt-0 lg:w-1/2">
                  <IsoArt name="lathe" />
                </div>
                <a
                  href="#qualifications"
                  className="relative mt-8 flex min-h-11 items-center gap-3 self-start font-mono text-[11px] tracking-[0.14em] text-white/80 transition-colors hover:text-white lg:mt-auto"
                >
                  <span className="flex size-9 items-center justify-center rounded-full border border-white/40">
                    <ArrowDown size={14} />
                  </span>
                  {t.scroll}
                </a>
              </div>
              <div className="relative isolate col-span-2 flex min-h-52 flex-col justify-between gap-8 overflow-hidden rounded-xs bg-brand-orange p-7 text-white lg:col-span-4 lg:min-h-72 xl:p-9">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 180 110"
                  fill="none"
                  className="pointer-events-none absolute left-1/2 top-10 -z-10 hidden w-48 -translate-x-1/2 text-white/75 md:block lg:top-12 lg:w-44 xl:w-52"
                >
                  <g
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="90" cy="30" r="14" />
                    <path d="M62 82c0-16 12-28 28-28s28 12 28 28" />
                    <circle cx="39" cy="42" r="11" />
                    <path d="M18 82c0-12 9-22 21-22 6 0 12 3 16 7" />
                    <circle cx="141" cy="42" r="11" />
                    <path d="M162 82c0-12-9-22-21-22-6 0-12 3-16 7" />
                    <path d="M12 96h156" strokeDasharray="3 6" />
                  </g>
                  <circle
                    cx="90"
                    cy="30"
                    r="5"
                    fill="currentColor"
                    opacity=".45"
                  />
                </svg>
                <div className="flex items-start justify-between">
                  <span
                    aria-hidden="true"
                    className="mt-3 h-0.5 w-8 bg-white"
                  />
                  <ArrowUpRight
                    size={36}
                    strokeWidth={1.25}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-5xl font-bold leading-none tracking-tight sm:text-6xl xl:text-7xl">
                    10,000+
                  </p>
                  <p className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                    {language === "ta"
                      ? "பணியாளர்கள் பணியமர்த்தப்பட்டனர்"
                      : "Workers hired"}
                  </p>
                </div>
              </div>
              {(["Machining", "Assembly"] as const).map((dept, i) => (
                <div
                  key={dept}
                  className="iso-on-paper iso-grid hidden min-h-52 md:flex flex-col justify-between gap-6 rounded-xs bg-paper p-5 sm:p-6 lg:col-span-2 lg:min-h-64"
                >
                  <div
                    data-chip
                    className="mx-auto flex h-20 items-center sm:h-28"
                  >
                    <IsoArt
                      name={departmentArt[dept]}
                      className="h-full w-auto"
                    />
                  </div>
                  <div className="flex items-end justify-between gap-2 border-t border-ink/10 pt-4">
                    <p className="text-base font-semibold tracking-tight">
                      {t.dept[dept]}
                    </p>
                    <Index value={i + 1} className="text-brand-orange" />
                  </div>
                </div>
              ))}
            </Container>
          </section>

          <Affiliates />
          <WhatWeDo />
          {/* Qualifications: blueprint panel + numbered spec table */}
          <section
            id="qualifications"
            aria-labelledby="qualifications-heading"
            className="scroll-mt-24 py-20 xl:py-28"
          >
            <Container className="grid gap-2 lg:grid-cols-12">
              <div
                data-reveal
                className="iso-on-blue relative isolate flex flex-col overflow-hidden rounded-xs bg-brand-blue blueprint-grid p-7 text-white sm:p-10 lg:col-span-5 xl:p-12"
              >
                <Eyebrow tone="light">{t.available}</Eyebrow>
                <h2
                  id="qualifications-heading"
                  className="mt-8 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] xl:text-5xl"
                >
                  {t.allQualifications}
                  <br />
                  <span className="underline decoration-brand-orange decoration-[3px] underline-offset-[10px]">
                    {t.place}
                  </span>
                </h2>
                <p className="mt-7 max-w-sm text-sm leading-7 text-white/75">
                  {t.qualificationNote}
                </p>
                <div className="mx-auto my-10 w-full max-w-72">
                  <IsoArt name="steps" />
                </div>
                <Button asChild variant="orange" className="mt-auto self-start">
                  <Link href="/jobs">
                    {t.seeOpenings}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col rounded-xs border border-ink/10 bg-white lg:col-span-7">
                <div className="grid grid-cols-[4rem_1fr_auto] items-center border-b border-ink/10">
                  <span className="flex h-full items-center justify-center border-r border-ink/10 py-5 font-mono text-[11px] text-brand-grey">
                    #
                  </span>
                  <p className="px-6 text-sm font-semibold">
                    {t.qualifications}
                  </p>
                  <span className="px-6 font-mono text-[11px] tracking-[0.14em] text-brand-grey">
                    SVG / JOBS
                  </span>
                </div>
                {t.qualificationsList.slice(0, 5).map((q, i) => {
                  const Icon = qualificationIcons[i] ?? Layers3;
                  return (
                    <div
                      data-qualification
                      key={q}
                      className={cn(
                        "grid flex-1 grid-cols-[4rem_1fr_auto] items-stretch border-b transition-colors duration-200 last:border-b-0",
                        "border-ink/10 hover:bg-paper",
                      )}
                    >
                      <span
                        className={cn(
                          "flex items-center justify-center border-r",
                          "border-ink/10",
                        )}
                      >
                        <Index value={i + 1} className={"text-brand-orange"} />
                      </span>
                      <h3 className="flex min-h-18 items-center px-6 text-xl font-semibold tracking-tight sm:text-2xl">
                        {q}
                      </h3>
                      <span className="flex items-center px-6">
                        <Icon
                          size={22}
                          strokeWidth={1.25}
                          aria-hidden="true"
                          className={"text-brand-blue"}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
            </Container>
          </section>

          {/* Open roles */}
          <section
            id="roles"
            className="scroll-mt-24 border-t border-ink/10 bg-paper py-20 xl:py-28"
          >
            <Container>
              <div
                data-reveal
                className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end"
              >
                <div className="lg:col-span-8">
                  <Eyebrow>{t.roles}</Eyebrow>
                  <h2 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] xl:text-6xl">
                    {t.openings}
                  </h2>
                </div>
                <p className="text-sm leading-6 text-brand-grey lg:col-span-4 lg:text-right">
                  {t.openingsNote}
                </p>
              </div>
              <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3 xl:grid-cols-5">
                {jobs.map((job, i) => (
                  <div
                    data-reveal
                    key={job.slug}
                    className="w-[70%] shrink-0 snap-start md:w-auto"
                  >
                    <JobCard job={job} index={i} />
                  </div>
                ))}
              </div>
            </Container>
          </section>

          {/* Journey */}
          <section
            id="how"
            className="iso-on-blue relative overflow-hidden bg-brand-blue blueprint-grid py-20 text-white xl:py-28"
          >
            <Container>
              <Eyebrow tone="light">{t.howLabel}</Eyebrow>
              <h2 className="mt-6 text-4xl font-semibold tracking-[-0.03em] xl:text-6xl">
                {t.how}
              </h2>
              <div className="relative mt-14 grid border border-white/25 md:grid-cols-3">
                <svg
                  className="pointer-events-none absolute inset-x-0 top-9 hidden h-px w-full md:block"
                  viewBox="0 0 1000 2"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    data-connector
                    d="M0 1 H1000"
                    fill="none"
                    stroke="#ee5a2f"
                    strokeWidth="2"
                    strokeDasharray="4 8"
                  />
                </svg>
                {t.steps.map((s, i) => (
                  <div
                    data-reveal
                    key={s}
                    className="flex flex-col border-white/25 not-last:border-b md:not-last:border-b-0 md:not-last:border-r"
                  >
                    <div className="relative flex items-center px-6 py-4">
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-xs font-mono text-sm font-semibold",
                          "border border-white/40 bg-brand-blue",
                        )}
                      >
                        0{i + 1}
                      </span>
                    </div>
                    <div className="flex h-52 items-center justify-center border-y border-white/25 px-10 py-8">
                      <IsoArt
                        name={journeyArt[i]}
                        className="h-full w-auto max-w-full"
                      />
                    </div>
                    <div className="p-6 xl:p-8">
                      <h3 className="text-xl font-semibold tracking-tight">
                        {s}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-white/70">
                        {t.stepNotes[i]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>

          <Testimonials />
          <Faq />

          {/* Closing call to action: Okean "contact" tile */}
          <section className="bg-paper pb-16 xl:pb-24">
            <Container>
              <div className="iso-on-blue relative isolate grid items-center gap-10 overflow-hidden rounded-xs bg-brand-blue blueprint-grid p-8 text-white md:grid-cols-12 md:p-12 xl:p-16">
                <div
                  aria-hidden="true"
                  className="absolute -bottom-40 -right-40 -z-10 size-96 rounded-full bg-brand-orange"
                />
                <div className="md:col-span-7">
                  <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.035em] xl:text-7xl">
                    {t.ready}
                    <br />
                    {t.starts}
                  </h2>
                  <p className="mt-6 max-w-md text-sm leading-6 text-white/80">
                    {t.readyNote}
                  </p>
                  <Button
                    asChild
                    variant="orange"
                    className="mt-9 min-w-56 py-4"
                  >
                    <Link href="/jobs">
                      {t.apply}
                      <ArrowUpRight size={22} />
                    </Link>
                  </Button>
                </div>
                <div className="mx-auto w-full max-w-xs md:col-span-5 md:max-w-sm">
                  <IsoArt name="arrow" />
                </div>
              </div>
            </Container>
          </section>
        </main>
      </div>
    </SiteShell>
  );
}
