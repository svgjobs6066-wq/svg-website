import { requireStaff } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/api";
export async function GET() {
  try {
    const { db, role } = await requireStaff();
    if (role === "supervisor") {
      return Response.json(
        { counts: [], role, recruiters: [] },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const results = await Promise.all([
      db
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      db
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "contacted"),
      db
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "no_response"),
      db
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "selected"),
      db
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "not_fit"),
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
