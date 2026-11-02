import { z } from "zod";
import { requireStaff } from "@/lib/supabase/server";
import { ApiError, checkOrigin, errorResponse, readJson } from "@/lib/api";
import { departments } from "@/lib/jobs";
const schema = z
  .object({
    id: z.string().uuid().optional(),
    slug: z
      .string()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().trim().min(2).max(120),
    department: z.enum(departments),
    location: z.string().max(120).nullable(),
    job_type: z.string().max(100).nullable(),
    highlight: z.string().max(200),
    eligibility: z.string().max(500).nullable(),
    status: z.enum(["active", "paused", "closed"]),
  })
  .strict();
export async function GET() {
  try {
    const { db } = await requireStaff();
    const { data, error } = await db
      .from("jobs")
      .select("*")
      .order("created_at");
    if (error) throw error;
    return Response.json(
      { jobs: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { db, role } = await requireStaff();
    if (role !== "admin") throw new ApiError(403, "Admin access required.");
    const parsed = schema.safeParse(await readJson(request));
    if (!parsed.success)
      throw new ApiError(
        400,
        "Check the job fields and use a lowercase, hyphenated slug.",
      );
    const { id, ...job } = parsed.data;
    const { error } = id
      ? await db.from("jobs").update(job).eq("id", id)
      : await db.from("jobs").insert(job);
    if (error)
      throw new ApiError(
        400,
        "Could not save the job. Check that the slug is unique.",
      );
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
