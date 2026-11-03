import { redirect, unstable_rethrow } from "next/navigation";
import { requireStaff } from "@/lib/supabase/server";
import { Workspace } from "./workspace";
export async function ProtectedPage({
  view,
}: {
  view: "dashboard" | "applications" | "jobs" | "supervisors" | "logs";
}) {
  let role: "admin" | "recruiter" | "supervisor";
  try {
    ({ role } = await requireStaff());
  } catch (error) {
    unstable_rethrow(error);
    redirect("/admin/login");
  }
  if (role === "supervisor" && view !== "applications") {
    redirect("/admin/applications");
  }
  if ((view === "supervisors" || view === "logs") && role !== "admin")
    redirect("/admin/applications");
  return <Workspace view={view} role={role} />;
}
