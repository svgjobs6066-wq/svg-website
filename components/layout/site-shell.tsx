"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu, ArrowRight } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./provider";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
export function Wordmark({ light = false }: { light?: boolean }) {
  const { t } = useLanguage();
  return (
    <Link
      href="/"
      aria-label={t.company}
      className="flex items-center gap-3 rounded focus-visible:outline-2 focus-visible:outline-brand-blue"
    >
      {process.env.NEXT_PUBLIC_LOGO_PATH ? (
        <Image
          src={process.env.NEXT_PUBLIC_LOGO_PATH}
          alt="SVG"
          width={100}
          height={56}
          className="h-12 w-auto object-contain"
        />
      ) : (
        <span className="flex items-end text-[38px] font-extrabold leading-none tracking-[-4px]">
          <span className={light ? "text-white" : "text-brand-blue"}>S</span>
          <span className="text-brand-orange">V</span>
          <span className="text-brand-green">G</span>
          <span className="mb-1 ml-1 size-2 rounded-full bg-brand-orange" />
        </span>
      )}
 
    </Link>
  );
}
export function Header() {
  const { t, language, toggle } = useLanguage();
  const [open, setOpen] = useState(false);
  const links = [
    [t.roles, "/#roles"],
    // [t.qualifications, "/#qualifications"],
    [t.faq, "/#faq"],
  ];
  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-2 z-[100] -translate-y-24 rounded-lg bg-white p-4 focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="relative z-30 flex h-24 w-full items-center justify-between gap-4 border-b border-ink/10 bg-paper px-4 md:px-8 xl:px-16">
        <Wordmark />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 text-sm font-medium lg:flex"
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="py-3 transition-colors hover:text-brand-blue"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 md:gap-5">
          <button
            onClick={toggle}
            aria-label={
              language === "en" ? "Switch to Tamil" : "Switch to English"
            }
            className="min-h-11 rounded-full px-3 text-xs font-bold hover:bg-white focus-visible:outline-2 focus-visible:outline-brand-blue"
          >
            <span
              className={
                language === "en" ? "text-brand-blue" : "text-brand-grey"
              }
            >
              EN
            </span>
            <span className="mx-2 text-ink/25">/</span>
            <span
              lang="ta"
              className={
                language === "ta" ? "text-brand-blue" : "text-brand-grey"
              }
            >
              தமிழ்
            </span>
          </button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/careers">
              {t.careers}
              <ArrowUpRight size={17} />
            </Link>
          </Button>
          <button
            aria-label={t.menu}
            onClick={() => setOpen(true)}
            className="flex size-11 items-center justify-center rounded-full border border-ink/15 lg:hidden"
          >
            <Menu size={21} />
          </button>
        </div>
      </header>
      <Sheet title={t.careers} open={open} onOpenChange={setOpen}>
        <nav className="flex flex-col gap-4">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="border-b py-5 text-xl"
            >
              {label}
            </Link>
          ))}
          <Button asChild>
            <Link href="/careers" onClick={() => setOpen(false)}>
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
  return (
    <footer className="bg-ink px-4 pb-28 pt-14 text-white md:px-8 md:pb-8 xl:px-16">
      <div className="flex flex-col justify-between gap-10 border-b border-white/15 pb-12 md:flex-row">
        <div>
          <Wordmark light />
          <p className="mt-5 text-sm text-white/60">{t.footerNote}</p>
        </div>
        <div className="flex flex-wrap items-start gap-8 text-sm">
          <Link href="/careers" className="py-3">
            {t.careers}
          </Link>
          <Link href="/privacy" className="py-3">
            {t.privacy}
          </Link>
          <Link href="/terms" className="py-3">
            {t.terms}
          </Link>
          <Link href="/admin/login" className="py-3 text-white/60">
            {t.admin}
          </Link>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-between gap-4 text-xs text-white/55">
        <p>
          © 2026 {t.company}. {t.rights}
        </p>
        <p>{t.tagline}</p>
      </div>
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
      {pathname !== "/careers" && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white p-3 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden">
          <Button asChild className="w-full">
            <Link href="/careers">
              {t.apply}
              <ArrowUpRight size={18} />
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
