import { Suspense } from "react";
import { Home } from "@/components/home/home";
import { getJobs } from "@/lib/supabase/jobs";
import { PageLoading } from "@/components/ui/page-loading";
async function Content() {
  return <Home jobs={await getJobs()} />;
}
export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Content />
    </Suspense>
  );
}
