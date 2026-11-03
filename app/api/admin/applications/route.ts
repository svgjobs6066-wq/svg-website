import { z } from "zod";
import { requireStaff } from "@/lib/supabase/server";
import { ApiError, checkOrigin, errorResponse, readJson } from "@/lib/api";
import { statuses } from "@/lib/jobs";
import { adminClient } from "@/lib/supabase/admin";
export async function GET(request: Request) {
  try {
    const { db, role } = await requireStaff();
    const params = new URL(request.url).searchParams;
    const page = Math.max(0, Number(params.get("page")) || 0);
    let query = db
      .from("applications")
      .select("*,jobs(title)", { count: "exact" });
    if (params.get("id")) query = query.eq("id", params.get("id"));
    const search = (params.get("search") || "")
      .replace(/[^\p{L}\p{N} -]/gu, "")
      .slice(0, 100);
    if (search)
      query = query.or(
        `full_name.ilike.%${search}%,phone.ilike.%${search}%,ref_no.ilike.%${search}%`,
      );
    if (params.get("job")) query = query.eq("job_id", params.get("job"));
    if (params.get("status")) query = query.eq("status", params.get("status"));
    if (/^\d{4}-\d{2}-\d{2}$/.test(params.get("date") || ""))
      query = query
        .gte("created_at", `${params.get("date")}T00:00:00Z`)
        .lte("created_at", `${params.get("date")}T23:59:59.999Z`);
    const { data, error, count } = await query
      .order("created_at", { ascending: params.get("sort") === "oldest" })
      .range(page * 50, page * 50 + 49);
    if (error) throw error;
    return Response.json(
      { applications: data, count, role },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
export async function PATCH(request: Request) {
  try {
    checkOrigin(request);
    const { db, role } = await requireStaff();
    const parsed = z
      .object({
        id: z.string().uuid(),
        status: z.enum(statuses).optional(),
        notes: z.string().max(5000).optional(),
        assigned_to: z.string().uuid().nullable().optional(),
      })
      .strict()
      .safeParse(await readJson(request));
    if (!parsed.success) throw new ApiError(400, "Invalid update.");
    const { id, assigned_to, ...update } = parsed.data;
    if (
      role === "supervisor" &&
      (assigned_to !== undefined || update.notes !== undefined)
    )
      throw new ApiError(403, "Supervisors may only change status.");
    if (assigned_to !== undefined) {
      if (role !== "admin") throw new ApiError(403, "Admin access required.");
      const { error } = await db.rpc("assign_application", {
        p_id: id,
        p_assignee: assigned_to,
      });
      if (error) throw error;
    }
    if (Object.keys(update).length) {
      const { data, error } = await db
        .from("applications")
        .update(update)
        .eq("id", id)
        .select("id")
        .single();
      if (error || !data)
        throw new ApiError(
          409,
          "Could not update application. Refresh and try again.",
        );
    }
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    const { role, user } = await requireStaff();
    if (role !== "admin") throw new ApiError(403, "Admin access required.");
    const parsed = z
      .object({ ids: z.array(z.string().uuid()).min(1).max(50) })
      .strict()
      .safeParse(await readJson(request));
    if (!parsed.success)
      throw new ApiError(400, "Select between 1 and 50 applications.");
    const ids = [...new Set(parsed.data.ids)];
    const service = adminClient();
    const ready = await service.rpc("manual_deletion_enabled");
    if (ready.error || ready.data !== true)
      throw new ApiError(
        503,
        "Apply the manual deletion database migration before deleting applications.",
      );
    const { data: apps, error } = await service
      .from("applications")
      .select("id,resume_path")
      .in("id", ids);
    if (error) throw error;
    const paths = (apps || []).flatMap((a) =>
      a.resume_path ? [a.resume_path] : [],
    );
    if (paths.length) {
      const removed = await service.storage.from("resumes").remove(paths);
      if (removed.error)
        throw new ApiError(
          503,
          "Resume removal failed. No applications were deleted; please retry.",
        );
    }
    const result = await service.rpc("delete_applications_manually", {
      p_ids: ids,
      p_actor: user.id,
    });
    if (result.error)
      throw new ApiError(
        503,
        "Could not finish deletion. Some resumes may already be removed. Please retry.",
      );
    return Response.json({ deleted: result.data });
  } catch (e) {
    return errorResponse(e);
  }
}
