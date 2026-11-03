"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/layout/provider";
import { Container, Eyebrow } from "@/components/ui/swiss";
import { IsoArt } from "@/components/iso/iso-art";

export function WhatWeDo() {
  const { language } = useLanguage();
  const tamil = language === "ta";
  const areas = [
    {
      art: "apply" as const,
      title: tamil ? "உங்கள் திறமைகளை அறிகிறோம்" : "We get to know you",
      description: tamil
        ? "உங்கள் திறமைகள், அனுபவம் மற்றும் நீங்கள் விரும்பும் பணியை அறிந்துகொள்கிறோம்."
        : "Tell us about your skills, experience and the work you are looking for.",
    },
    {
      art: "call" as const,
      title: tamil ? "வாய்ப்புகளை இணைக்கிறோம்" : "We find a suitable job",
      description: tamil
        ? "நிறுவனங்களின் தேவைகளுக்கு ஏற்ப, உங்களுக்குப் பொருத்தமான பணிகளை ஆராய்கிறோம்."
        : "We look for jobs at companies that need people with your skills.",
    },
    {
      art: "join" as const,
      title: tamil ? "பணியில் இணைவதற்கு வழிகாட்டுகிறோம்" : "We help you join",
      description: tamil
        ? "தேர்வு செய்யப்பட்டால், நிறுவனத்தில் பணியில் சேரும் அடுத்த படிகளுக்கு வழிகாட்டுகிறோம்."
        : "If selected, we guide you through the next steps to join the company.",
    },
  ];
  return (
    <section
      id="what-we-do"
      aria-labelledby="what-we-do-heading"
      className="bg-paper py-20 xl:py-28"
    >
      <Container>
        <div
          data-reveal
          className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end"
        >
          <div className="lg:col-span-7">
            <Eyebrow>
              {tamil ? "நாங்கள் என்ன செய்கிறோம்" : "WHAT WE DO"}
            </Eyebrow>
            <h2
              id="what-we-do-heading"
              className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl"
            >
              {tamil
                ? "மக்களையும் வேலை வாய்ப்புகளையும் இணைக்கிறோம்."
                : "We help you find a job."}
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-brand-grey lg:col-span-5 lg:justify-self-end">
            {tamil
              ? "SVG ஒரு ஒப்பந்தப் பணியாளர் சேவை நிறுவனம். பணியாளர்களைத் தேடும் நிறுவனங்களையும், வேலை தேடும் நபர்களையும் இணைத்து, தேவையான இடங்களில் பணியமர்த்த உதவுகிறோம்."
              : "Companies come to us when they need workers. We hire people and help them join companies looking for their skills."}
          </p>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {areas.map((area, i) => (
            <article
              data-reveal
              key={area.art}
              className="iso-on-white group flex flex-col border border-ink/10 bg-white p-6 transition-colors hover:border-brand-blue/40 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-5">
                <span className="font-mono text-xs text-brand-orange">
                  0{i + 1} / SVG
                </span>
                <IsoArt name={area.art} className="h-20 w-24" />
              </div>
              <h3 className="mt-7 text-xl font-semibold tracking-tight">
                {area.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-brand-grey">
                {area.description}
              </p>
            </article>
          ))}
        </div>
        <Link
          href="/jobs"
          className="mt-8 inline-flex min-h-11 items-center gap-5 text-sm font-semibold text-brand-blue hover:underline underline-offset-4"
        >
          {tamil ? "அனைத்து வேலைகளையும் பார்க்க" : "Explore all jobs"}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </Container>
    </section>
  );
}
