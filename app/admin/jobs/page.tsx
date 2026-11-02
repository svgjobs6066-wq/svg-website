import { Suspense } from "react";
import { ProtectedPage } from "@/components/admin/protected-page";
export const metadata = {
  title: "Manage openings",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <Suspense fallback={<p className="p-12">Checking access…</p>}>
      <ProtectedPage view="jobs" />
    </Suspense>
  );
}
