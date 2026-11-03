import { z } from "zod";
import { requireStaff } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { ApiError, checkOrigin, errorResponse, readJson } from "@/lib/api";
async function authorize() {
  const staff = await requireStaff();
  if (staff.role !== "admin") throw new ApiError(403, "Admin access required.");
  return staff;
}
export async function GET() {
  try {
    const { db } = await authorize();
    const service = adminClient();
    const { data, error } = await db
      .from("profiles")
      .select("id")
      .eq("role", "supervisor");
    if (error) throw error;
    const supervisors = await Promise.all(
      (data || []).map(async ({ id }) => {
        const result = await service.auth.admin.getUserById(id);
        if (result.error) throw result.error;
        return { id, email: result.data.user.email };
      }),
    );
    return Response.json(
      { supervisors },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await authorize();
    const parsed = z
      .object({
        email: z.string().email(),
        password: z.string().min(12).max(128),
      })
      .strict()
      .safeParse(await readJson(request));
    if (!parsed.success)
      throw new ApiError(
        400,
        "Enter a valid email and a password of at least 12 characters.",
      );
    const service = adminClient();
    const { data, error } = await service.auth.admin.createUser({
      ...parsed.data,
      email_confirm: true,
    });
    if (error)
      throw new ApiError(
        400,
        "Could not create account. Check whether the email is already registered.",
      );
    const profile = await service
      .from("profiles")
      .insert({ id: data.user.id, role: "supervisor" });
    if (profile.error) {
      await service.auth.admin.deleteUser(data.user.id);
      throw profile.error;
    }
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    await authorize();
    const parsed = z
      .object({ id: z.string().uuid() })
      .strict()
      .safeParse(await readJson(request));
    if (!parsed.success) throw new ApiError(400, "Invalid supervisor.");
    const service = adminClient();
    const { data, error } = await service
      .from("profiles")
      .select("role")
      .eq("id", parsed.data.id)
      .single();
    if (error || data?.role !== "supervisor")
      throw new ApiError(404, "Supervisor not found.");
    const result = await service.auth.admin.deleteUser(parsed.data.id);
    if (result.error) throw result.error;
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
