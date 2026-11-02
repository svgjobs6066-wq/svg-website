"use client";
import { IsoArt } from "@/components/iso/iso-art";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen bg-white p-2 md:grid-cols-2">
      <div className="flex flex-col justify-center rounded-xs bg-paper p-8 md:p-14">
        <span aria-hidden="true" className="mb-10 h-0.5 w-7 bg-brand-orange" />
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-6xl">
          We couldn’t load this page.
        </h1>
        <p className="mt-5 text-brand-grey">Please try again in a moment.</p>
        <button
          onClick={reset}
          className="mt-10 inline-flex min-h-12 items-center self-start rounded-xs bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-deep"
        >
          Try again
        </button>
      </div>
      <div className="iso-on-blue mt-2 flex items-center justify-center rounded-xs bg-brand-blue blueprint-grid p-12 md:mt-0 md:ml-2">
        <div className="w-full max-w-sm">
          <IsoArt name="cubes" />
        </div>
      </div>
    </main>
  );
}
