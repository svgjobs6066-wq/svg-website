import "server-only";
import { createClient } from "@supabase/supabase-js";
import { seedJobs, type Job } from "@/lib/jobs";
export async function getJobs(): Promise<Job[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return seedJobs;
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await db
    .from("jobs")
    .select("*")
    .eq("status", "active")
    .order("created_at");
  if (error?.code === "PGRST205" && process.env.NODE_ENV === "development") {
    console.warn("SVG preview: apply the Supabase recruitment migration to enable live openings and applications.");
    return seedJobs;
  }
  if (error || !Array.isArray(data))
    throw new Error("Could not load openings. Please try again later.");
  return data as Job[];
}
