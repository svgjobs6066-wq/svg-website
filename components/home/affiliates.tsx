"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { useLanguage } from "@/components/layout/provider";
import { Container, Eyebrow } from "@/components/ui/swiss";

// Replace these placeholders with the names of companies that have agreed to be listed.
const affiliates = [1, 2, 3, 4, 5, 6];

export function Affiliates() {
  const { language } = useLanguage();
  const [paused, setPaused] = useState(false);
  const tamil = language === "ta";
  return (
    <section
      aria-labelledby="affiliates-heading"
      className="overflow-hidden border-b border-ink/10 bg-white py-16 md:py-20"
    >
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <Eyebrow>
              {tamil ? "இணைந்த நிறுவனங்கள்" : "OUR NETWORK"}
            </Eyebrow>
            <h2
              id="affiliates-heading"
              className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl"
            >
              {tamil ? "இணைந்த நிறுவனங்கள்" : "Companies in our network."}
            </h2>
            <p className="mt-3 text-sm text-brand-grey">
              {tamil
                ? "மாதிரி இடங்கள் — நிறுவன விவரங்கள் விரைவில் சேர்க்கப்படும்."
                : "Sample placeholders — company details will be added here."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPaused(!paused)}
            aria-label={
              paused
                ? tamil
                  ? "சுழற்சியைத் தொடரவும்"
                  : "Play company scroll"
                : tamil
                  ? "சுழற்சியை நிறுத்தவும்"
                  : "Pause company scroll"
            }
            className="flex size-11 items-center justify-center rounded-xs border border-ink/15 text-brand-blue hover:border-brand-blue motion-reduce:hidden"
          >
            {paused ? (
              <Play size={17} aria-hidden="true" />
            ) : (
              <Pause size={17} aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="overflow-hidden motion-reduce:overflow-x-auto">
          <div
            className="affiliate-track flex w-max min-w-full motion-reduce:animate-none"
            style={{ animationPlayState: paused ? "paused" : "running" }}
          >
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1}
                className={`flex min-w-[100vw] shrink-0 justify-around ${copy === 1 ? "motion-reduce:hidden" : ""}`}
              >
                {affiliates.map((number) => (
                  <div
                    key={number}
                    className="flex h-24 w-48 shrink-0 items-center gap-3 border border-r-0 border-ink/10 px-5 last:border-r md:w-56"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-10 items-center justify-center bg-paper font-mono text-xs text-brand-blue"
                    >
                      {String(number).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold text-brand-grey">
                      {tamil ? "மாதிரி நிறுவனம்" : "Sample company"} {number}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
