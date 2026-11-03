import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
test("supervisor status-only permissions and durable audit identity", async () => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key,email text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
 create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
    for (const file of [
      "202611020001_recruitment.sql",
      "202611030001_supervisors.sql",
    ])
      await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
    const id = "00000000-0000-0000-0000-000000000001";
    await db.exec(
      `insert into auth.users values('${id}','supervisor@example.test');insert into public.profiles values('${id}','supervisor');insert into public.applications(full_name,phone,preferred_location,qualification,consent_version) values('Applicant','9876543210','Chennai','ITI','v1');set role authenticated;select set_config('request.jwt.claim.sub','${id}',false);`,
    );
    assert.equal(
      (await db.query("select * from public.applications")).rows.length,
      1,
    );
    await db.exec("update public.applications set status='selected'");
    await assert.rejects(
      db.exec("update public.applications set notes='Forbidden'"),
    );
    await assert.rejects(db.exec("update public.profiles set role='admin'"));
    await assert.rejects(
      db.exec("update public.applications set status='interview'"),
    );
    assert.equal(
      (await db.query("select * from public.audit_logs")).rows.length,
      0,
    );
    await db.exec(`reset role;delete from auth.users where id='${id}'`);
    const result = await db.query<{
      detail: { actor_email: string; status: string };
    }>("select detail from public.audit_logs");
    assert.equal(result.rows[0].detail.actor_email, "supervisor@example.test");
    assert.equal(result.rows[0].detail.status, "selected");
    await db.exec(
      await readFile(
        "supabase/migrations/202611030002_manual_deletion.sql",
        "utf8",
      ),
    );
    await db.exec("select set_config('request.jwt.claim.sub','',false)");
    await db.exec(
      "update public.applications set maximum_delete_at=now(),delete_after=now()",
    );
    assert.equal(
      (
        await db.query<{ maximum_delete_at: null }>(
          "select maximum_delete_at from public.applications",
        )
      ).rows[0].maximum_delete_at,
      null,
    );
    assert.equal(
      (await db.query("select * from public.claim_resume_purge()")).rows.length,
      0,
    );
    await db.exec(
      "insert into auth.users values('00000000-0000-0000-0000-000000000002','admin@example.test');insert into public.profiles values('00000000-0000-0000-0000-000000000002','admin');insert into public.applications(full_name,phone,preferred_location,qualification,consent_version) values('Second','9876543211','Chennai','ITI','v1')",
    );
    await db.exec("set role authenticated");
    await assert.rejects(
      db.exec(
        "select public.delete_applications_manually(array(select id from public.applications),'00000000-0000-0000-0000-000000000002')",
      ),
    );
    await db.exec("reset role");
    const deleted = await db.query<{ n: number }>(
      "select public.delete_applications_manually(array(select id from public.applications),'00000000-0000-0000-0000-000000000002') n",
    );
    assert.equal(deleted.rows[0].n, 2);
    assert.equal(
      (await db.query("select * from public.applications")).rows.length,
      0,
    );
    const audit = await db.query<{
      application_id: null;
      detail: { reference: string };
    }>(
      "select application_id,detail from public.audit_logs where action='application_deleted'",
    );
    assert.equal(audit.rows.length, 2);
    assert.ok(
      audit.rows.every(
        (r) =>
          r.application_id === null && r.detail.reference.startsWith("SVG-"),
      ),
    );
  } finally {
    await db.close();
  }
});
