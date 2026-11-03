import "server-only";
import { unstable_rethrow } from "next/navigation";
import { createHash } from "node:crypto";
import { adminClient } from "./supabase/admin";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function errorResponse(error: unknown) {
  unstable_rethrow(error);
  if (error instanceof ApiError)
    return Response.json({ error: error.message }, { status: error.status });
  if (
    error instanceof Error &&
    ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)
  )
    return Response.json(
      { error: "Please sign in with an authorized account." },
      { status: error.message === "UNAUTHORIZED" ? 401 : 403 },
    );
  console.error(
    "Request failed",
    error instanceof Error ? error.message : "unknown",
  );
  return Response.json(
    { error: "Service temporarily unavailable. Please try again later." },
    { status: 503 },
  );
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.APP_URL || new URL(request.url).origin;
  if (!origin || origin !== new URL(expected).origin)
    throw new ApiError(403, "Invalid request origin.");
}
export async function readJson(request: Request) {
  if (Number(request.headers.get("content-length")) > 20_000)
    throw new ApiError(413, "Request too large.");
  const text = await request.text();
  if (text.length > 20_000) throw new ApiError(413, "Request too large.");
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(400, "Invalid request.");
  }
}
export async function rateLimit(request: Request, scope: string) {
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "local";
  const salt = process.env.RATE_LIMIT_SECRET;
  if (!salt)
    throw new ApiError(503, "Applications are temporarily unavailable.");
  const key = createHash("sha256")
    .update(`${salt}:${scope}:${ip}`)
    .digest("hex");
  const { data, error } = await adminClient().rpc("consume_rate_limit", {
    p_key: key,
  });
  if (error) throw error;
  if (!data)
    throw new ApiError(429, "Too many requests. Please try again in an hour.");
}
