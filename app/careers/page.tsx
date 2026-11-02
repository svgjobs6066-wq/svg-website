import { Suspense } from "react";
import { Careers } from "@/components/careers/careers";
import { getJobs } from "@/lib/supabase/jobs";
import { retentionDays } from "@/lib/api";
export const metadata = { title: "Careers" };
async function Content({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const [params, jobs] = await Promise.all([searchParams, getJobs()]);
  return (
    <Careers
      jobs={jobs}
      initialJob={params.job || "any"}
      uploadsEnabled={retentionDays() > 0}
    />
  );
}
export default function Page(props: {
  searchParams: Promise<{ job?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-16">Loading careers…</div>}>
      <Content {...props} />
    </Suspense>
  );
}
