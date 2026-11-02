"use client";

import { ArrowUpRight, Quote } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/layout/provider";

export function Testimonials() {
  const { language } = useLanguage();
  const tamil = language === "ta";
  const stories = tamil
    ? [
        {
          topic: "புதிய தொடக்கம்",
          quote:
            "எனது திறமைகளைப் பயன்படுத்தவும், புதிய விஷயங்களைக் கற்றுக்கொள்ளவும் ஒரு வாய்ப்பைத் தேடினேன்.",
          role: "புதிய விண்ணப்பதாரர்",
          initials: "01",
        },
        {
          topic: "அடுத்த படி",
          quote:
            "என் அனுபவத்திற்கு ஏற்ற வேலையைக் கண்டறிவதே எனது அடுத்த இலக்கு.",
          role: "அனுபவமுள்ள விண்ணப்பதாரர்",
          initials: "02",
        },
        {
          topic: "ஒன்றாக வளர்வோம்",
          quote:
            "ஒரு நல்ல குழுவுடன் இணைந்து, என் தொழில் திறமைகளை வளர்த்துக்கொள்ள விரும்புகிறேன்.",
          role: "தொழில்நுட்ப விண்ணப்பதாரர்",
          initials: "03",
        },
      ]
    : [
        {
          topic: "A fresh start",
          quote:
            "I was looking for an opportunity to put my skills to work and keep learning something new.",
          role: "Early-career applicant",
          initials: "01",
        },
        {
          topic: "The next step",
          quote:
            "Finding a role that makes the most of my experience is the next step I want to take.",
          role: "Experienced applicant",
          initials: "02",
        },
        {
          topic: "Growing together",
          quote:
            "I want to build my craft, contribute to a team, and feel proud of the work we do together.",
          role: "Technical applicant",
          initials: "03",
        },
      ];

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative isolate overflow-hidden border-b border-ink/10 bg-[#eef3f6] px-4 py-20 md:px-8 xl:px-16 xl:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[480px] rounded-full border-[70px] border-white/60"
      />
      <div
        data-reveal
        className="mb-12 flex flex-wrap items-end justify-between gap-7"
      >
        <div className="max-w-2xl">
          <p className="mb-5 flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-brand-blue">
            <span className="h-px w-8 bg-brand-orange" />
            {tamil ? "அனுபவப் பகிர்வுகள்" : "PEOPLE & POSSIBILITIES"}
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl font-bold leading-tight tracking-tight md:text-5xl"
          >
            {tamil ? "ஒவ்வொரு பயணத்திற்கும்" : "Behind every skill,"}
            <br />
            <span className="text-brand-blue">
              {tamil ? "ஒரு கதை உண்டு." : "there’s a story."}
            </span>
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-brand-grey">
            {tamil
              ? "இவை மாதிரி வாசகங்கள். உண்மையான அனுபவப் பகிர்வுகள் அனுமதியுடன் விரைவில் சேர்க்கப்படும்."
              : "A preview of our testimonials. These illustrative quotes will be replaced with real stories shared with permission."}
          </p>
        </div>
        <Link
          href="/careers"
          className="inline-flex min-h-11 items-center gap-5 rounded-full border border-ink/20 bg-white px-6 py-3 text-sm font-bold transition-colors hover:border-brand-blue hover:text-brand-blue"
        >
          {tamil ? "உங்கள் பயணத்தைத் தொடங்குங்கள்" : "Start your story"}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {stories.map((story, index) => (
          <figure
            data-reveal
            key={story.initials}
            className={`relative flex flex-col rounded-3xl border p-7 shadow-sm motion-safe:transition-[translate,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-1 hover:shadow-xl md:p-9 ${index === 1 ? "border-brand-blue bg-brand-blue text-white lg:-translate-y-3" : "border-white bg-white text-ink"}`}
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <Quote
                size={38}
                strokeWidth={1.3}
                aria-hidden="true"
                className={index === 1 ? "text-white/75" : "text-brand-blue"}
              />
              <span
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider ${index === 1 ? "bg-white/15 text-white" : "bg-paper text-brand-grey"}`}
              >
                {tamil ? "மாதிரி வாசகம்" : "SAMPLE TESTIMONIAL"}
              </span>
            </div>
            <p
              className={`mb-4 text-xs font-semibold ${index === 1 ? "text-white/80" : "text-brand-blue"}`}
            >
              {story.topic}
            </p>
            <blockquote className="mb-10 text-xl font-medium leading-relaxed tracking-tight">
              “{story.quote}”
            </blockquote>
            <figcaption
              className={`mt-auto flex items-center gap-4 border-t pt-6 ${index === 1 ? "border-white/25" : "border-ink/10"}`}
            >
              <span
                aria-hidden="true"
                className={`flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${index === 1 ? "bg-brand-orange text-ink" : "bg-blue-50 text-brand-blue"}`}
              >
                {story.initials}
              </span>
              <div>
                <p className="text-sm font-bold">{story.role}</p>
                <p
                  className={`mt-1 text-xs ${index === 1 ? "text-white/80" : "text-brand-grey"}`}
                >
                  {tamil ? "விளக்கத்திற்கான மாதிரி" : "Illustrative story"}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
