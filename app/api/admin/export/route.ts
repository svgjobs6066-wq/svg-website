import { requireStaff } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { ApiError, errorResponse } from "@/lib/api";
function csv(value: unknown) {
  const text = String(value ?? "");
  return `"${(/^[\s]*[=+@-]/.test(text) ? "'" : "") + text.replaceAll('"', '""')}"`;
}
export async function GET() {
  try {
    const { db, role, user } = await requireStaff();
    if (role !== "admin") throw new ApiError(403, "Admin access required.");
    const columns = [
      "ref_no",
      "full_name",
      "phone",
      "preferred_location",
      "qualification",
      "experience",
      "status",
      "reviewed",
      "created_at",
    ];
    const rows: string[] = [columns.join(",")];
    let offset = 0;
    while (true) {
      const { data, error } = await db
        .from("applications")
        .select(columns.join(","))
        .order("id")
        .range(offset, offset + 999);
      if (error) throw error;
      for (const row of data || []) {
        const record = row as unknown as Record<string, unknown>;
        rows.push(columns.map((c) => csv(record[c])).join(","));
      }
      if (!data || data.length < 1000) break;
      offset += 1000;
    }
    const { error } = await adminClient()
      .from("audit_logs")
      .insert({
        actor: user.id,
        action: "applications_csv_export",
        detail: { rows: rows.length - 1 },
      });
    if (error) throw error;
    return new Response("\uFEFF" + rows.join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=svg-applications.csv",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
