"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen px-6 py-24">
      <h1 className="text-3xl font-bold">We couldn’t load this page.</h1>
      <p className="mt-4 text-brand-grey">Please try again in a moment.</p>
      <button
        onClick={reset}
        className="mt-8 min-h-11 rounded-full bg-brand-blue px-6 py-3 text-white"
      >
        Try again
      </button>
    </main>
  );
}
