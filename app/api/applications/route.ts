import { adminClient } from "@/lib/supabase/admin";
import { applicationSchema, validFileSignature } from "@/lib/validation";
import {
  ApiError,
  checkOrigin,
  errorResponse,
  rateLimit,
  readJson,
  retentionDays,
} from "@/lib/api";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await rateLimit(request, "application");
    const parsed = applicationSchema.safeParse(await readJson(request));
    if (!parsed.success)
      throw new ApiError(400, "Please check your application details.");
    const input = parsed.data;
    const db = adminClient();
    let id = crypto.randomUUID();
    let resumePath: string | null = null;
    if (input.uploadTicket) {
      const { data: intent } = await db
        .from("upload_intents")
        .select("*")
        .eq("id", input.uploadTicket)
        .is("consumed_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();
      if (!intent)
        throw new ApiError(
          400,
          "Upload expired. Please upload your resume again.",
        );
      const { data: file, error } = await db.storage
        .from("resumes")
        .download(intent.path);
      if (
        error ||
        !file ||
        file.size !== intent.size ||
        file.size > 5242880 ||
        !validFileSignature(
          new Uint8Array(await file.arrayBuffer()),
          intent.path.split(".").pop()!,
        )
      )
        throw new ApiError(
          400,
          "The resume file is invalid. Please upload a valid document.",
        );
      id = intent.application_id;
      resumePath = intent.path;
    }
    let jobId: string | null = null;
    if (input.job !== "any") {
      const { data: job } = await db
        .from("jobs")
        .select("id")
        .eq("slug", input.job)
        .eq("status", "active")
        .single();
      if (!job)
        throw new ApiError(
          400,
          "That role is no longer available. Please choose another role.",
        );
      jobId = job.id;
    }
    const days = retentionDays();
    if (resumePath && !days)
      throw new ApiError(503, "Resume uploads are not enabled.");
    const { data, error } = await db.rpc("submit_application", {
      p_id: id,
      p_name: input.full_name,
      p_phone: input.phone,
      p_job: jobId,
      p_location: input.preferred_location,
      p_qualification: input.qualification,
      p_experience: input.experience || null,
      p_resume: resumePath,
      p_ticket: input.uploadTicket || null,
      p_retention_days: days,
    });
    if (error) {
      if (error.code === "23505")
        throw new ApiError(
          409,
          "An application for this phone number and role already exists.",
        );
      throw error;
    }
    return Response.json(
      { reference: data },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
