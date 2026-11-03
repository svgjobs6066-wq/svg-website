import { ProtectedPage } from "@/components/admin/protected-page";
import { Suspense } from "react";
export default function Page() {
  return <Suspense fallback={<p className="p-12">Checking access…</p>}><ProtectedPage view="supervisors" /></Suspense>;
}
