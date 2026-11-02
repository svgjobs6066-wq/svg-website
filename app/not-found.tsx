import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { IsoArt } from "@/components/iso/iso-art";
export default function NotFound() {
  return (
    <main className="grid min-h-screen bg-white p-2 md:grid-cols-2">
      <div className="flex flex-col justify-between gap-12 rounded-xs bg-paper p-8 md:p-14">
        <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] text-brand-blue">
          <span aria-hidden="true" className="h-0.5 w-7 bg-brand-orange" />
          404 / SVG
        </p>
        <div>
          <h1 className="text-5xl font-semibold leading-[1] tracking-[-0.045em] md:text-7xl">
            This page has moved on.
          </h1>
          <Link
            href="/careers"
            className="mt-10 inline-flex min-h-12 items-center gap-6 rounded-xs bg-brand-blue py-3 pl-5 pr-4 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-deep"
          >
            Explore careers
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="iso-on-blue mt-2 flex items-center justify-center rounded-xs bg-brand-blue blueprint-grid p-12 md:mt-0 md:ml-2">
        <div className="w-full max-w-sm">
          <IsoArt name="cubes" />
        </div>
      </div>
    </main>
  );
}
