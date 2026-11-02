import { Suspense } from "react";
import { Home } from "@/components/home/home";
import { getJobs } from "@/lib/supabase/jobs";
async function Content() {
  return <Home jobs={await getJobs()} />;
}
export default function Page() {
  return (
    <Suspense fallback={<div className="p-16">Loading SVG careers…</div>}>
      <Content />
    </Suspense>
  );
}
