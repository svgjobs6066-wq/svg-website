import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import {
  ApiError,
  checkOrigin,
  errorResponse,
  rateLimit,
  readJson,
} from "@/lib/api";
import { validateResume } from "@/lib/validation";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await rateLimit(request, "upload");

    const body = z
      .object({
        name: z.string().max(200),
        type: z.string().max(100),
        size: z.number(),
        website: z.string().max(0).optional(),
      })
      .safeParse(await readJson(request));
    if (!body.success) throw new ApiError(400, "Invalid upload.");
    const ext = validateResume(body.data.name, body.data.type, body.data.size);
    if (!ext)
      throw new ApiError(400, "Use a PDF, DOC or DOCX file up to 5 MB.");
    const db = adminClient();
    const ticket = crypto.randomUUID();
    const appId = crypto.randomUUID();
    const path = `${appId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await db.from("upload_intents").insert({
      id: ticket,
      application_id: appId,
      path,
      size: body.data.size,
      mime: body.data.type,
    });
    if (error) throw error;
    const { data, error: uploadError } = await db.storage
      .from("resumes")
      .createSignedUploadUrl(path, { upsert: false });
    if (uploadError) throw uploadError;
    return Response.json(
      { ticket, path, token: data.token },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
