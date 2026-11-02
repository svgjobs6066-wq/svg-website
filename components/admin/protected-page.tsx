import { redirect, unstable_rethrow } from "next/navigation";
import { requireStaff } from "@/lib/supabase/server";
import { Workspace } from "./workspace";
export async function ProtectedPage({
  view,
}: {
  view: "dashboard" | "applications" | "jobs";
}) {
  let role: "admin" | "recruiter";
  try {
    ({ role } = await requireStaff());
  } catch (error) {
    unstable_rethrow(error);
    redirect("/admin/login");
  }
  return <Workspace view={view} role={role} />;
}
