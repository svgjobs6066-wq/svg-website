import { requireStaff } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api";
export async function GET(request: Request) {
  try {
    const { db, role } = await requireStaff();
    if (role !== "admin") throw new ApiError(403, "Admin access required.");
    const params = new URL(request.url).searchParams;
    const page = Math.max(0, Math.floor(Number(params.get("page")) || 0));
    const search = (params.get("search") || "")
      .replace(/[^\p{L}\p{N} -]/gu, "")
      .slice(0, 100);
    const referenceSearch = /^svg-/i.test(search) && params.get("action") === "application_deleted";
    let query = db
      .from("audit_logs")
      .select(
        search && !referenceSearch
          ? "*,applications!inner(ref_no,full_name)"
          : "*,applications(ref_no,full_name)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(page * 50, page * 50 + 49);
    const id = params.get("application");
    if (id) query = query.eq("application_id", id);
    if (referenceSearch) query = query.ilike("detail->>reference", `%${search}%`);
    else if (search)
      query = query.or(`ref_no.ilike.%${search}%,full_name.ilike.%${search}%`, {
        referencedTable: "applications",
      });
    if (params.get("action")) query = query.eq("action", params.get("action"));
    if (params.get("status"))
      query = query.eq("detail->>status", params.get("status"));
    const actor = (params.get("actor") || "")
      .replace(/[%_]/g, "")
      .slice(0, 120);
    if (actor) query = query.ilike("detail->>actor_email", `%${actor}%`);
    for (const key of ["from", "to"]) {
      const date = params.get(key);
      if (date && /^\d{4}-\d{2}-\d{2}$/.test(date))
        query =
          key === "from"
            ? query.gte("created_at", `${date}T00:00:00Z`)
            : query.lte("created_at", `${date}T23:59:59.999Z`);
    }
    const { data, error, count } = await query;
    if (error) throw error;
    return Response.json(
      { logs: data, count },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
