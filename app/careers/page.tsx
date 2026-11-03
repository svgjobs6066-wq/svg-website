import { Suspense } from "react";
import { Careers } from "@/components/careers/careers";
import { getJobs } from "@/lib/supabase/jobs";
import { PageLoading } from "@/components/ui/page-loading";
export const metadata = { title: "Jobs" };
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
      uploadsEnabled={Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)}
    />
  );
}
export default function Page(props: {
  searchParams: Promise<{ job?: string }>;
}) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Content {...props} />
    </Suspense>
  );
}
