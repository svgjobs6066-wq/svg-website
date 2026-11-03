"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu, ArrowRight } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./provider";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Container } from "@/components/ui/swiss";
import { cn } from "@/lib/utils";
export function Wordmark({
  light = false,
  dark = false,
}: {
  light?: boolean;
  dark?: boolean;
}) {
  const { t } = useLanguage();
  const logoPath = dark
    ? process.env.NEXT_PUBLIC_DARK_LOGO_PATH ||
      process.env.NEXT_PUBLIC_LOGO_PATH
    : process.env.NEXT_PUBLIC_LOGO_PATH;
  return (
    <Link
      href="/"
      aria-label={t.company}
      className="flex items-center gap-3 rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange"
    >
      {logoPath ? (
        <Image
          src={logoPath}
          alt="SVG"
          width={100}
          height={56}
          className="h-11 w-auto object-contain"
        />
      ) : (
        <span className="flex items-end text-[34px] font-extrabold leading-none tracking-[-0.08em]">
          <span className={light ? "text-white" : "text-brand-blue"}>S</span>
          <span className="text-brand-orange">V</span>
          <span className={light ? "text-white/70" : "text-brand-green"}>
            G
          </span>
          <span className="mb-1 ml-1.5 size-1.5 bg-brand-orange" />
        </span>
      )}
    </Link>
  );
}

/** Okean-style text link: ink label sitting on a 2px orange rule. */
const navLink =
  "relative py-3 text-sm font-medium after:absolute after:inset-x-0 after:bottom-2 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand-orange after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100";

export function Header() {
  const { t, language, toggle } = useLanguage();
  const [open, setOpen] = useState(false);
  const links = [
    [language === "ta" ? "தற்போதைய வேலைகள்" : "Current jobs", "/jobs"],
    // [t.qualifications, "/#qualifications"],
    [t.faq, "/#faq"],
  ];
  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-2 z-[100] -translate-y-24 rounded-xs bg-white p-4 focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 w-full border-b border-ink/10 bg-white/90 backdrop-blur-md">
        <Container className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-10">
            <Wordmark />
            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-8 lg:flex"
            >
              {links.map(([label, href]) => (
                <Link key={href} href={href} className={navLink}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggle}
              aria-label={
                language === "en" ? "Switch to Tamil" : "Switch to English"
              }
              className="flex min-h-11 items-center rounded-xs border border-ink/10 px-3 font-mono text-[11px] font-medium transition-colors hover:border-brand-blue focus-visible:outline-2 focus-visible:outline-brand-orange"
            >
              <span
                className={
                  language === "en" ? "text-brand-blue" : "text-brand-grey"
                }
              >
                EN
              </span>
              <span className="mx-2 h-3 w-px bg-ink/20" />
              <span
                lang="ta"
                className={
                  language === "ta" ? "text-brand-blue" : "text-brand-grey"
                }
              >
                தமிழ்
              </span>
            </button>
            <Button asChild className="hidden min-h-11 sm:inline-flex">
              <Link href="/jobs">
                {t.careers}
                <ArrowUpRight size={17} />
              </Link>
            </Button>
            <button
              aria-label={t.menu}
              onClick={() => setOpen(true)}
              className="flex size-11 items-center justify-center rounded-xs border border-ink/15 lg:hidden"
            >
              <Menu size={21} />
            </button>
          </div>
        </Container>
      </header>
      <Sheet title={t.careers} open={open} onOpenChange={setOpen}>
        <nav className="flex flex-col gap-4">
          {links.map(([label, href], i) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-4 border-b border-ink/10 py-5 text-xl font-semibold"
            >
              <span className="font-mono text-xs text-brand-orange">
                0{i + 1}
              </span>
              {label}
            </Link>
          ))}
          <Button asChild className="mt-4">
            <Link href="/jobs" onClick={() => setOpen(false)}>
              {t.apply}
              <ArrowRight size={18} />
            </Link>
          </Button>
        </nav>
      </Sheet>
    </>
  );
}
export function Footer() {
  const { t } = useLanguage();
  const links = [
    [t.careers, "/jobs"],
    [t.privacy, "/privacy"],
    [t.terms, "/terms"],
  ];
  return (
    <footer className="bg-brand-blue-deep pb-28 pt-16 text-white md:pb-10">
      <Container>
        <div className="grid gap-10 border-b border-white/15 pb-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <Wordmark light dark />
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/65">
              {t.footerNote}
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 text-sm sm:grid-cols-4 md:col-span-6"
          >
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="border-t border-white/15 py-4 transition-colors hover:text-brand-orange-soft"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/admin/login"
              className="border-t border-white/15 py-4 text-white/55 transition-colors hover:text-white"
            >
              {t.admin}
            </Link>
          </nav>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-4 font-mono text-[11px] uppercase tracking-wider text-white/55">
          <p>
            © 2026 {t.company}. {t.rights}
          </p>
          <p>{t.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}
export function SiteShell({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  return (
    <>
      <Header />
      {children}
      <Footer />
      {pathname !== "/jobs" && (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 p-3 backdrop-blur-md md:hidden",
            "pb-[max(12px,env(safe-area-inset-bottom))]",
          )}
        >
          <Button asChild className="w-full">
            <Link href="/jobs">
              {t.apply}
              <ArrowUpRight size={18} />
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
