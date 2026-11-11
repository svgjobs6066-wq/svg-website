import "server-only";

import { createClient } from "@supabase/supabase-js";
import { seedJobs, type Job } from "@/lib/jobs";

export async function getJobs(): Promise<Job[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("[Jobs] Supabase environment variables missing", {
      hasUrl: Boolean(url),
      hasKey: Boolean(key),
    });

    if (process.env.NODE_ENV === "development") {
      return seedJobs;
    }

    throw new Error("Supabase configuration is missing.");
  }

  try {
    const db = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await db
      .from("jobs")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Jobs] Supabase query failed:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      if (
        error.code === "PGRST205" &&
        process.env.NODE_ENV === "development"
      ) {
        return seedJobs;
      }

      throw new Error("Could not load openings.");
    }

    if (!Array.isArray(data)) {
      console.error("[Jobs] Unexpected response:", data);
      throw new Error("Invalid jobs response.");
    }

    return data as Job[];
  } catch (error) {
    console.error("[Jobs] Failed to fetch jobs:", error);

    throw new Error(
      "Could not load openings. Please try again later.",
    );
  }
}