import Link from "next/link";
export default function NotFound() {
  return (
    <main className="min-h-screen px-6 py-24">
      <p className="text-brand-blue">404 / SVG</p>
      <h1 className="mt-5 text-4xl font-bold">This page has moved on.</h1>
      <Link
        href="/careers"
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-brand-blue px-6 py-3 text-white"
      >
        Explore careers →
      </Link>
    </main>
  );
}
