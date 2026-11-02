import { z } from "zod";
import { requireStaff } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { ApiError, checkOrigin, errorResponse, readJson } from "@/lib/api";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { db, user } = await requireStaff();
    const parsed = z
      .object({ id: z.string().uuid() })
      .safeParse(await readJson(request));
    if (!parsed.success) throw new ApiError(400, "Invalid application.");
    const { data: app } = await db
      .from("applications")
      .select("id,resume_path,ref_no,purge_started_at")
      .eq("id", parsed.data.id)
      .single();
    if (!app?.resume_path || app.purge_started_at)
      throw new ApiError(404, "Resume is unavailable or deleted.");
    const service = adminClient();
    const { error: auditError } = await service
      .from("audit_logs")
      .insert({
        actor: user.id,
        application_id: app.id,
        action: "resume_download",
      });
    if (auditError) throw auditError;
    const { data, error } = await service.storage
      .from("resumes")
      .createSignedUrl(app.resume_path, 60, {
        download: `${app.ref_no}.${app.resume_path.split(".").pop()}`,
      });
    if (error) throw error;
    return Response.json(
      { url: data.signedUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
