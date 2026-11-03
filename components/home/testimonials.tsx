"use client";

import { ArrowUpRight, Quote, UserRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/layout/provider";
import { Button } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/swiss";
import { cn } from "@/lib/utils";

// Add approved photo paths from public/ here, for example "/testimonials/person-1.jpg".
const testimonialPhotos: Record<string, string> = {};

export function Testimonials() {
  const { language } = useLanguage();
  const tamil = language === "ta";
  const stories = tamil
    ? [
        {
          topic: "புதிய தொடக்கம்",
          quote:
            "வேலை தேடிக்கொண்டிருந்த எனக்கு SVG வேலை கிடைக்க உதவியது. அந்த வாய்ப்பு என் வாழ்க்கையில் ஒரு புதிய தொடக்கமாக அமைந்தது.",
          role: "புதிய விண்ணப்பதாரர்",
          initials: "01",
        },
        {
          topic: "அடுத்த படி",
          quote:
            "விண்ணப்பிப்பது முதல் பணியில் சேர்வது வரை எல்லாமே எளிதாக இருந்தது. ஒவ்வொரு படியிலும் எனக்கு வழிகாட்டினார்கள்.",
          role: "அனுபவமுள்ள விண்ணப்பதாரர்",
          initials: "02",
        },
        {
          topic: "ஒன்றாக வளர்வோம்",
          quote:
            "என் திறமைக்கு ஏற்ற வேலையைக் கண்டுபிடிக்க உதவினார்கள். இப்போது நம்பிக்கையுடன் அடுத்த படியை எடுத்து வைக்கிறேன்.",
          role: "தொழில்நுட்ப விண்ணப்பதாரர்",
          initials: "03",
        },
      ]
    : [
        {
          topic: "A fresh start",
          quote:
            "I was looking for a job when SVG helped me find work. That opportunity gave me a fresh start in life.",
          role: "First-time applicant",
          initials: "01",
        },
        {
          topic: "A simple process",
          quote:
            "From applying to joining, the process was easy to understand. The team guided me at every step.",
          role: "Experienced applicant",
          initials: "02",
        },
        {
          topic: "A future to look forward to",
          quote:
            "They helped me find work that suits my skills. Now I can take my next step with confidence.",
          role: "Technical applicant",
          initials: "03",
        },
      ];

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="border-b border-ink/10 bg-white py-20 xl:py-28"
    >
      <Container>
        <div
          data-reveal
          className="mb-12 grid gap-7 lg:grid-cols-12 lg:items-end"
        >
          <div className="lg:col-span-8">
            <Eyebrow>
              {tamil ? "அனுபவப் பகிர்வுகள்" : "PEOPLE & POSSIBILITIES"}
            </Eyebrow>
            <h2
              id="testimonials-heading"
              className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl"
            >
              {tamil ? "ஒவ்வொரு பயணத்திற்கும்" : "Behind every skill,"}
              <br />
              <span className="text-brand-blue">
                {tamil ? "ஒரு கதை உண்டு." : "there’s a story."}
              </span>
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-brand-grey">
              {tamil
                ? "இவை மாதிரி வாசகங்கள். உண்மையான அனுபவப் பகிர்வுகள் அனுமதியுடன் விரைவில் சேர்க்கப்படும்."
                : "A preview of our testimonials. These illustrative quotes will be replaced with real stories shared with permission."}
            </p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <Button asChild variant="outline">
              <Link href="/jobs">
                {tamil ? "உங்கள் பயணத்தைத் தொடங்குங்கள்" : "Start your story"}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-2 lg:grid-cols-3">
          {stories.map((story) => {
            return (
              <figure
                data-reveal
                key={story.initials}
                className={cn(
                  "relative flex flex-col rounded-xs border p-7 transition-[border-color] duration-200 md:p-9",
                  "border-brand-blue bg-brand-blue blueprint-grid text-white",
                )}
              >
                <div className="mb-10 flex items-center justify-between gap-4">
                  <Quote
                    size={34}
                    strokeWidth={1.25}
                    aria-hidden="true"
                    className={"text-brand-orange"}
                  />
                  <span
                    className={cn(
                      "rounded-xs px-2.5 py-1.5 font-mono text-[10px] tracking-wider",
                      "bg-white/10 text-white",
                    )}
                  >
                    {tamil ? "மாதிரி வாசகம்" : "SAMPLE TESTIMONIAL"}
                  </span>
                </div>
                <p
                  className={cn(
                    "mb-4 font-mono text-[11px] uppercase tracking-wider",
                    "text-white/75",
                  )}
                >
                  {story.topic}
                </p>
                <blockquote className="mb-10 text-xl font-medium leading-relaxed tracking-tight">
                  “{story.quote}”
                </blockquote>
                <figcaption
                  className={cn(
                    "mt-auto flex items-center gap-4 border-t pt-6",
                    "border-white/25",
                  )}
                >
                  <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-white/80">
                    {testimonialPhotos[story.initials] ? (
                      <Image
                        src={testimonialPhotos[story.initials]}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <UserRound size={26} aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{story.role}</p>
                    <p className={cn("mt-1 text-xs", "text-white/75")}>
                      {tamil ? "விளக்கத்திற்கான மாதிரி" : "Illustrative story"}
                    </p>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
