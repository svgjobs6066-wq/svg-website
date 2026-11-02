import { requireStaff } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/api";
export async function GET() {
  try {
    const { db, role } = await requireStaff();
    const results = await Promise.all([
      db
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      db
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("reviewed", true),
      db
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "shortlisted"),
      db
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "selected"),
      db
        .from("applications")
        .select("id", { count: "exact", head: true })
        .not("resume_path", "is", null)
        .not("delete_after", "is", null),
    ]);
    for (const result of results) if (result.error) throw result.error;
    const { data: recruiters } =
      role === "admin"
        ? await db.from("profiles").select("id").eq("role", "recruiter")
        : { data: [] };
    return Response.json(
      { counts: results.map((r) => r.count || 0), role, recruiters },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
