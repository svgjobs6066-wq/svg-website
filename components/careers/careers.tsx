"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { flushSync } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUpRight, FileUp, LockKeyhole } from "lucide-react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { useLanguage } from "@/components/layout/provider";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { JobCard, Faq } from "@/components/home/home";
import { type Job, departments } from "@/lib/jobs";
import {
  applicationSchema,
  type ApplicationInput,
  qualifications,
  experiences,
  validateResume,
} from "@/lib/validation";
import { browserClient } from "@/lib/supabase/client";
import { Container, Eyebrow } from "@/components/ui/swiss";
import { IsoArt } from "@/components/iso/iso-art";
import { useIsoDraw } from "@/components/iso/use-iso-draw";
import { cn } from "@/lib/utils";
gsap.registerPlugin(Flip, DrawSVGPlugin, useGSAP);
const labelClass = "mb-2 block text-sm font-semibold";
export function Careers({
  jobs,
  initialJob,
  uploadsEnabled,
}: {
  jobs: Job[];
  initialJob: string;
  uploadsEnabled: boolean;
}) {
  const { t } = useLanguage();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [department, setDepartment] = useState("All");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const successRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      job: jobs.some((j) => j.slug === initialJob) ? initialJob : "any",
      preferred_location: "",
      qualification: undefined,
      experience: "",
      consent: false,
      website: "",
    },
  });
  const values = useWatch({ control });
  const progress =
    [
      values.full_name && values.full_name.length >= 2,
      /^[6-9]\d{9}$/.test(values.phone || ""),
      values.job,
      values.preferred_location && values.preferred_location.length >= 2,
      values.qualification,
      values.consent,
    ].filter(Boolean).length / 6;
  useEffect(() => {
    if (reference) successRef.current?.focus();
  }, [reference]);
  useIsoDraw(root);
  const { contextSafe } = useGSAP({ scope: root });
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (reference) {
          gsap.fromTo(
            "[data-success-check]",
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: 0.6 },
          );
          gsap.from("[data-reference-character]", {
            opacity: 0,
            stagger: 0.045,
            duration: 0.1,
          });
        }
        if (message)
          gsap
            .timeline()
            .to("form", { x: -4, duration: 0.06 })
            .to("form", { x: 4, duration: 0.08, repeat: 3, yoyo: true })
            .to("form", { x: 0, duration: 0.06 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [reference, message], revertOnUpdate: true },
  );
  function filter(value: string) {
    contextSafe(() => {
      const cards = list.current?.querySelectorAll("[data-filter-card]");
      const state = cards ? Flip.getState(cards) : null;
      flushSync(() => setDepartment(value));
      if (
        state &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        Flip.from(state, {
          duration: 0.45,
          ease: "power2.inOut",
          absolute: true,
          scale: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { opacity: 0, scale: 0.95 },
              { opacity: 1, scale: 1, duration: 0.3 },
            ),
        });
    })();
  }
  function selectJob(slug: string) {
    setValue("job", slug, { shouldValidate: true, shouldDirty: true });
    window.history.replaceState(null, "", `/jobs?job=${slug}`);
    document.getElementById("application")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    document.getElementById("full_name")?.focus({ preventScroll: true });
  }
  async function submit(data: ApplicationInput) {
    setMessage("");
    try {
      let uploadTicket: string | undefined;
      if (file) {
        if (!validateResume(file.name, file.type, file.size))
          throw new Error(t.resumeHint);
        const response = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            type: file.type,
            website: data.website,
          }),
        });
        const upload = await response.json();
        if (!response.ok) throw new Error(upload.error || t.uploadFailed);
        const { error } = await browserClient()
          .storage.from("resumes")
          .uploadToSignedUrl(upload.path, upload.token, file, {
            contentType: file.type,
          });
        if (error) throw new Error(t.uploadFailed);
        uploadTicket = upload.ticket;
      }
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, uploadTicket }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t.unavailable);
      setReference(result.reference);
      setFile(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t.unavailable);
    }
  }
  const field = (
    name: "full_name" | "phone" | "preferred_location",
    label: string,
    placeholder?: string,
  ) => (
    <div>
      <label className={labelClass} htmlFor={name}>
        {label} <span className="text-brand-orange">*</span>
      </label>
      <Input
        id={name}
        {...register(name)}
        placeholder={placeholder}
        type={name === "phone" ? "tel" : "text"}
        inputMode={name === "phone" ? "numeric" : "text"}
        autoComplete={
          name === "phone"
            ? "tel-national"
            : name === "full_name"
              ? "name"
              : "address-level2"
        }
        maxLength={name === "phone" ? 10 : 120}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
      />
      {errors[name] && (
        <p id={`${name}-error`} className="mt-2 text-xs text-red-700">
          {t.required}
        </p>
      )}
    </div>
  );
  return (
    <SiteShell>
      <main id="main" ref={root}>
        <section className="pt-2 md:pt-4">
          <Container className="grid gap-2 lg:grid-cols-12">
            <div className="iso-grid flex flex-col justify-between gap-10 rounded-xs bg-paper p-7 sm:p-10 lg:col-span-7 xl:p-14">
              <Eyebrow>SVG / {t.careers}</Eyebrow>
              <div>
                <h1 className="text-5xl font-semibold leading-[1] tracking-[-0.045em] md:text-7xl">
                  {t.careerTitle}
                </h1>
                <p className="mt-6 max-w-md text-base leading-7 text-brand-grey">
                  {t.careerIntro}
                </p>
                <Button asChild className="mt-9 min-w-48">
                  <a href="#application">
                    {t.apply}
                    <ArrowDown size={18} />
                  </a>
                </Button>
              </div>
            </div>
            <div className="iso-on-blue relative flex min-h-80 items-center justify-center overflow-hidden rounded-xs bg-brand-blue blueprint-grid p-8 lg:col-span-5">
              <span className="absolute left-7 top-7 font-mono text-[11px] tracking-[0.14em] text-white/55">
                SVG / JOBS
              </span>
              <div className="w-full max-w-md pt-6">
                <IsoArt name="plant" />
              </div>
            </div>
          </Container>
        </section>
        <section className="py-12 md:py-16">
          <Container>
            <div
              aria-label={t.roles}
              className="mb-8 flex flex-wrap gap-px overflow-hidden rounded-xs border border-ink/10 bg-ink/10 sm:inline-flex"
            >
              {["All", ...departments].map((d) => (
                <button
                  key={d}
                  onClick={() => filter(d)}
                  aria-pressed={department === d}
                  className={cn(
                    "min-h-11 grow px-5 py-3 font-mono text-xs transition-colors duration-200 focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-orange sm:grow-0",
                    department === d
                      ? "bg-brand-blue text-white"
                      : "bg-white hover:bg-paper hover:text-brand-blue",
                  )}
                >
                  {d === "All" ? t.allRoles : t.dept[d]}
                </button>
              ))}
            </div>
            <div
              ref={list}
              className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            >
              {jobs
                .filter(
                  (job) =>
                    department === "All" || job.department === department,
                )
                .map((job, i) => (
                  <div key={job.slug} data-filter-card data-flip-id={job.slug}>
                    <JobCard
                      job={job}
                      index={i}
                      selected={values.job === job.slug}
                      onSelect={() => selectJob(job.slug)}
                    />
                  </div>
                ))}
            </div>
            {!jobs.some(
              (j) => department === "All" || j.department === department,
            ) && <p className="py-10 text-brand-grey">{t.noJobs}</p>}
          </Container>
        </section>
        <section
          id="application"
          className="scroll-mt-24 border-y border-ink/10 bg-paper py-16 xl:py-24"
        >
          <Container className="grid gap-10 lg:grid-cols-12 xl:gap-16">
            <div className="lg:col-span-4">
              <span className="mb-8 flex size-12 items-center justify-center rounded-xs bg-brand-orange text-ink">
                <ArrowUpRight size={24} />
              </span>
              <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] xl:text-5xl">
                {t.formTitle}
              </h2>
              <p className="mt-5 text-sm leading-7 text-brand-grey">
                {t.formNote}
              </p>
              <div className="iso-on-paper mx-auto mt-10 hidden w-full max-w-60 lg:block">
                <IsoArt name="apply" />
              </div>
              <div className="mt-10 flex items-start gap-3 border-t border-ink/15 pt-6 text-xs leading-6 text-brand-grey">
                <LockKeyhole className="shrink-0 text-brand-blue" size={18} />
                <p>
                  {t.reviewNote}
                  <br />
                  <Link
                    href="/privacy"
                    className="font-medium text-ink underline decoration-brand-orange decoration-2 underline-offset-4"
                  >
                    {t.privacy}
                  </Link>
                </p>
              </div>
            </div>
            {reference ? (
              <div
                ref={successRef}
                tabIndex={-1}
                role="status"
                className="rounded-xs border border-ink/10 bg-white p-8 outline-none md:p-12 lg:col-span-8"
              >
                <span className="flex size-14 items-center justify-center rounded-xs bg-brand-blue text-white">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      data-success-check
                      d="M4 12l5 5L20 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h2 className="mt-7 text-3xl font-semibold tracking-tight md:text-4xl">
                  {t.success}
                </h2>
                <p className="mt-4 max-w-lg leading-7 text-brand-grey">
                  {t.successNote}
                </p>
                <div className="my-8 grid grid-cols-[auto_1fr] items-stretch rounded-xs border border-ink/10">
                  <span className="flex items-center border-r border-ink/10 bg-paper px-5 font-mono text-[11px] tracking-widest text-brand-grey">
                    {t.reference}
                  </span>
                  <p className="p-5 font-mono text-2xl font-semibold tracking-wider text-brand-blue">
                    <span aria-label={reference}>
                      {reference.split("").map((character, i) => (
                        <span
                          key={i}
                          data-reference-character
                          aria-hidden="true"
                        >
                          {character}
                        </span>
                      ))}
                    </span>
                  </p>
                </div>
                <Button asChild variant="outline">
                  <a href="#main">{t.another}</a>
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(submit, () => setMessage(t.required))}
                noValidate
                className="rounded-xs border border-ink/10 bg-white lg:col-span-8"
              >
                <div className="border-b border-ink/10 px-6 py-5 md:px-9">
                  <div className="mb-3 flex justify-between font-mono text-[11px] uppercase tracking-wider text-brand-grey">
                    <span>{t.progress}</span>
                    <span className="tabular-nums text-brand-blue">
                      {Math.round(progress * 100)}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={t.progress}
                    aria-valuenow={Math.round(progress * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="relative h-1.5 overflow-hidden bg-paper"
                  >
                    <div
                      className="h-full origin-left bg-brand-orange transition-transform duration-300 ease-out motion-reduce:transition-none"
                      style={{ transform: `scaleX(${progress})` }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 grid grid-cols-6"
                    >
                      {[0, 1, 2, 3, 4, 5].map((tick) => (
                        <span
                          key={tick}
                          className="border-r-2 border-white last:border-r-0"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <fieldset
                  disabled={isSubmitting}
                  className="grid gap-6 p-6 md:grid-cols-2 md:p-9"
                >
                  {field("full_name", t.fullName)}
                  {field("phone", t.phone, "9876543210")}
                  <div>
                    <label htmlFor="job" className={labelClass}>
                      {t.job} <span className="text-brand-orange">*</span>
                    </label>
                    <Select
                      id="job"
                      {...register("job")}
                      aria-invalid={!!errors.job}
                    >
                      <option value="any">{t.anyRole}</option>
                      {jobs.map((job) => (
                        <option key={job.slug} value={job.slug}>
                          {t.jobTitles[job.title] || job.title}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {field("preferred_location", t.location, t.locationHint)}
                  <div>
                    <label htmlFor="qualification" className={labelClass}>
                      {t.qualification}{" "}
                      <span className="text-brand-orange">*</span>
                    </label>
                    <Select
                      id="qualification"
                      {...register("qualification")}
                      aria-invalid={!!errors.qualification}
                    >
                      <option value="">{t.choose}</option>
                      {qualifications.map((q, i) => (
                        <option key={q} value={q}>
                          {t.qualificationsList[i]}
                        </option>
                      ))}
                    </Select>
                    {errors.qualification && (
                      <p className="mt-2 text-xs text-red-700">{t.required}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="experience" className={labelClass}>
                      {t.experience}{" "}
                      <span className="font-normal text-brand-grey">
                        ({t.optional})
                      </span>
                    </label>
                    <Select id="experience" {...register("experience")}>
                      <option value="">{t.choose}</option>
                      {experiences.map((e, i) => (
                        <option key={e} value={e}>
                          {t.expOptions[i]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="resume" className={labelClass}>
                      {t.resume}{" "}
                      <span className="font-normal text-brand-grey">
                        ({t.optional})
                      </span>
                    </label>
                    {uploadsEnabled ? (
                      <div className="rounded-xs border border-dashed border-brand-blue/40 bg-brand-blue-soft/50 p-5">
                        <FileUp className="mb-3 text-brand-blue" size={22} />
                        <Input
                          id="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const next = e.target.files?.[0];
                            if (
                              next &&
                              !validateResume(next.name, next.type, next.size)
                            ) {
                              setMessage(t.resumeHint);
                              e.target.value = "";
                              setFile(null);
                            } else {
                              setFile(next || null);
                              setMessage("");
                            }
                          }}
                          className="min-h-0 border-0 bg-transparent p-0 text-sm hover:border-0 file:mr-3 file:rounded-xs file:border-0 file:bg-brand-blue file:px-3 file:py-2 file:text-white"
                        />
                        <p className="mt-2 font-mono text-[11px] text-brand-grey">
                          {t.resumeHint}
                        </p>
                      </div>
                    ) : (
                      <p className="rounded-xs border border-ink/10 bg-paper p-4 text-xs leading-6 text-brand-grey">
                        {t.uploadDisabled}
                      </p>
                    )}
                  </div>
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      {...register("website")}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  <label className="flex min-h-11 items-start gap-3 border-t border-ink/10 pt-6 text-xs leading-6 text-brand-grey md:col-span-2">
                    <input
                      type="checkbox"
                      {...register("consent")}
                      aria-invalid={!!errors.consent}
                      className="mt-1 size-5 shrink-0 accent-brand-blue"
                    />
                    {t.consent}
                  </label>
                  <div className="md:col-span-2">
                    {message && (
                      <p
                        role="alert"
                        className="mb-4 rounded-xs border-l-2 border-red-600 bg-red-50 p-4 text-sm text-red-800"
                      >
                        {message}
                      </p>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4"
                    >
                      {isSubmitting ? t.sending : t.send}
                      <ArrowUpRight size={18} />
                    </Button>
                    <p className="mt-4 text-center text-xs text-brand-grey">
                      {t.reviewNote}
                    </p>
                  </div>
                </fieldset>
              </form>
            )}
          </Container>
        </section>
        <Faq mini />
      </main>
    </SiteShell>
  );
}
