import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import {
  applicationSchema,
  validateResume,
  validFileSignature,
} from "../lib/validation";

test("application and resume validation rejects unsafe input", () => {
  const input = {
    full_name: "Test Applicant",
    phone: "9876543210",
    job: "any",
    preferred_location: "Chennai",
    qualification: "ITI",
    experience: "Fresher",
    consent: true,
  };
  assert.equal(applicationSchema.safeParse(input).success, true);
  for (const change of [
    { phone: "1234567890" },
    { consent: false },
    { full_name: " " },
    { website: "spam" },
    { qualification: "invalid" },
  ])
    assert.equal(
      applicationSchema.safeParse({ ...input, ...change }).success,
      false,
    );
  assert.equal(validateResume("cv.pdf", "application/pdf", 5242880), "pdf");
  assert.equal(validateResume("cv.pdf", "application/pdf", 5242881), null);
  assert.equal(validateResume("cv.exe", "application/pdf", 50), null);
  assert.equal(validateResume("cv.pdf", "text/html", 50), null);
  assert.equal(
    validFileSignature(new TextEncoder().encode("%PDF-1.4"), "pdf"),
    true,
  );
  assert.equal(
    validFileSignature(new TextEncoder().encode("<script>"), "pdf"),
    false,
  );
});

test("database RLS, duplicate checks, review timer, purge locking and audit", async () => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
 create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
    await db.exec(
      await readFile(
        "supabase/migrations/202611020001_recruitment.sql",
        "utf8",
      ),
    );
    const admin = "00000000-0000-0000-0000-000000000001",
      recruiter = "00000000-0000-0000-0000-000000000002",
      other = "00000000-0000-0000-0000-000000000003",
      app = "00000000-0000-0000-0000-000000000011";
    await db.exec(
      `insert into auth.users values('${admin}'),('${recruiter}'),('${other}');insert into public.profiles values('${admin}','admin'),('${recruiter}','recruiter'),('${other}','recruiter');`,
    );
    await db.query(
      `select public.submit_application($1,'Applicant','9876543210',null,'Placeholder','ITI',null,null,null,90)`,
      [app],
    );
    await assert.rejects(
      db.query(
        `select public.submit_application(gen_random_uuid(),'Duplicate','9876543210',null,'Placeholder','ITI',null,null,null,90)`,
      ),
      /duplicate key/,
    );
    await db.exec(
      `update public.applications set assigned_to='${recruiter}',resume_path='test/resume.pdf',maximum_delete_at=now()+interval '90 days' where id='${app}';set role anon;`,
    );
    assert.equal((await db.query("select * from public.jobs")).rows.length, 10);
    await assert.rejects(
      db.query("select * from public.applications"),
      /permission denied/,
    );
    await assert.rejects(
      db.query(`select public.consume_rate_limit('bypass')`),
      /permission denied/,
    );
    await db.exec(
      `reset role;set role authenticated;select set_config('request.jwt.claim.sub','${other}',false);`,
    );
    assert.equal(
      (await db.query("select * from public.applications")).rows.length,
      0,
    );
    await assert.rejects(
      db.query(`update public.profiles set role='admin' where id='${other}'`),
      /permission denied/,
    );
    await db.exec(
      `select set_config('request.jwt.claim.sub','${recruiter}',false);`,
    );
    assert.equal(
      (await db.query("select * from public.applications")).rows.length,
      1,
    );
    await assert.rejects(
      db.query(
        `update public.applications set assigned_to='${other}' where id='${app}'`,
      ),
      /permission denied/,
    );
    await db.exec(
      `update public.applications set reviewed=true,status='shortlisted' where id='${app}';`,
    );
    let row = (
      await db.query<{
        days: number;
        reviewed: boolean;
        delete_after: string | null;
      }>(
        `select extract(epoch from (delete_after-reviewed_at))/86400 as days,reviewed,delete_after from public.applications where id='${app}'`,
      )
    ).rows[0];
    assert.equal(Number(row.days), 10);
    assert.equal(row.reviewed, true);
    await db.exec(
      `update public.applications set reviewed=false where id='${app}'`,
    );
    row = (
      await db.query<typeof row>(
        `select reviewed,delete_after from public.applications where id='${app}'`,
      )
    ).rows[0];
    assert.equal(row.delete_after, null);
    await db.exec(
      `reset role;update public.applications set reviewed=true where id='${app}';update public.applications set delete_after=now()-interval '1 day' where id='${app}';`,
    );
    const claimed = await db.query(`select * from public.claim_resume_purge()`);
    assert.equal(claimed.rows.length, 1);
    assert.equal(
      (await db.query(`select * from public.claim_resume_purge()`)).rows.length,
      0,
    );
    await assert.rejects(
      db.exec(
        `update public.applications set reviewed=false where id='${app}'`,
      ),
      /deletion is in progress/,
    );
    assert.ok(
      (
        await db.query(
          `select * from public.audit_logs where application_id='${app}'`,
        )
      ).rows.length >= 3,
    );
    for (let i = 0; i < 10; i++)
      assert.equal(
        (
          await db.query<{ allowed: boolean }>(
            `select public.consume_rate_limit('test') as allowed`,
          )
        ).rows[0].allowed,
        true,
      );
    assert.equal(
      (
        await db.query<{ allowed: boolean }>(
          `select public.consume_rate_limit('test') as allowed`,
        )
      ).rows[0].allowed,
      false,
    );
    await db.exec(
      `set role authenticated;select set_config('request.jwt.claim.sub','${admin}',false);`,
    );
    assert.equal(
      (await db.query("select * from public.applications")).rows.length,
      1,
    );
    await db.exec(
      `update public.jobs set status='paused' where slug='accounts';reset role;set role anon;`,
    );
    assert.equal((await db.query("select * from public.jobs")).rows.length, 9);
  } finally {
    await db.close();
  }
});
