// Runs in Supabase's Deno Edge runtime, independently of Next.js.
import { createClient } from "npm:@supabase/supabase-js@2";
Deno.serve(async (request: Request) => {
 if (request.method !== "POST" || request.headers.get("x-purge-secret") !== Deno.env.get("PURGE_SECRET") || !Deno.env.get("PURGE_SECRET")) return new Response("Unauthorized", { status: 401 });
 const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
 const { data: rows, error } = await db.rpc("claim_resume_purge");
 if (error) return Response.json({ error: "Could not claim resumes" }, { status: 500 });
 let deleted = 0; let failed = 0;
 for (const row of rows || []) {
  const { error: removeError } = await db.storage.from("resumes").remove([row.resume_path]);
  if (removeError) { failed++; await db.from("applications").update({ purge_started_at: null }).eq("id",row.id); await db.from("audit_logs").insert({application_id:row.id,action:"resume_purge_failed"}); continue; }
  const { error: updateError } = await db.from("applications").update({ resume_path:null,resume_deleted_at:new Date().toISOString(),purge_started_at:null }).eq("id",row.id).eq("resume_path",row.resume_path);
  if (updateError) { failed++; continue; } deleted++;
  const { error: auditError } = await db.from("audit_logs").insert({ application_id:row.id,action:"resume_deleted" }); if (auditError) { failed++; console.error("Resume deletion audit failed",row.id); }
 }
 // Clean abandoned uploads only after signed upload URLs have expired.
 const { data: abandoned } = await db.from("upload_intents").select("id,path").is("consumed_at",null).lt("expires_at",new Date(Date.now()-86400000).toISOString()).limit(100);
 for (const upload of abandoned || []) { const { error } = await db.storage.from("resumes").remove([upload.path]); if (!error) await db.from("upload_intents").delete().eq("id",upload.id); else failed++; }
 await db.from("rate_limits").delete().lt("window_start",new Date(Date.now()-86400000).toISOString());
 console.log(JSON.stringify({deleted,failed})); return Response.json({deleted,failed},{status:failed ? 500 : 200});
});
