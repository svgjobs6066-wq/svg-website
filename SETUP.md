# SVG Recruitment

Built from `svg_recruitment_blueprint_v3.md`. The existing root `app/` structure is retained. All styling is Tailwind v4 utilities and theme tokens in `app/globals.css`.

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env.local` and enter your Supabase project URL, anon key, service-role key, rate-limit secret. Never expose the service-role key as a `NEXT_PUBLIC_` variable.
3. `npm run dev`

Without credentials, public pages show the ten blueprint seed roles. During local development only, a missing `jobs` table also uses those roles and logs a setup reminder. Submissions never show a fake success. Admin pages require a real authorized account. Production pages read active database jobs and do not fall back to stale seed roles on database errors.

## Logo and content

- Put your PNG in `public/brand/logo.png`, then set `NEXT_PUBLIC_LOGO_PATH=/brand/logo.png` and restart. Until then the site uses a temporary text wordmark and a geometric machining illustration, not a fabricated company photograph.
- Tokens currently use the blueprint’s approximate palette. Sample the final logo before launch.
- Locations remain “Location to be confirmed”; applicants can type a preferred city. Edit actual location, eligibility and job type in Admin → Openings.
- Testimonials and Stories navigation are intentionally hidden because no consented quotes were provided.
- Add verified recruitment contact details to the footer and Privacy notice. Replace the illustration with real shop photography if desired. No address, phone, salary or hiring guarantee is invented.
- Public content has English and Tamil dictionaries. Have a fluent Tamil speaker review the translation before launch. Staff tools currently use English.

## Supabase installation

The configured project was reachable during development, but its API reported `PGRST205` (the recruitment `jobs` table is missing). Apply the migration below before enabling live applications. The local development site continues showing the seed roles until then.

1. Apply `supabase/migrations/202611020001_recruitment.sql` with Supabase CLI migrations or the SQL editor. This creates tables, the ten seed jobs, RLS, a private 5 MB resume bucket, atomic duplicate prevention, audit logging and retention triggers.
2. Create an email/password user in Supabase Authentication. In the SQL editor, assign the user a role:

```sql
insert into public.profiles(id, role)
values ('USER_UUID_FROM_AUTH', 'admin');
```

For a recruiter use `recruiter`. Admins assign applications from the detail drawer. Recruiters can only view/update their assigned applications and cannot export CSV or edit jobs. Profile roles cannot be changed by public or ordinary authenticated users.

3. Sign in at `/admin/login`. Verify the dashboard, edit a job, and complete a real test application.
4. Set `APP_URL` to your exact website origin. Follow [SUPABASE_BUCKET_STEPS.md](./SUPABASE_BUCKET_STEPS.md) for the private resume bucket. The form uses a hidden honeypot and Supabase-backed rate limiting; no external CAPTCHA service is required.
5. The database rate limiter accepts at most ten submissions/uploads per hashed IP per hour, scoped separately. On Vercel it uses the platform forwarded-IP header. If deploying behind another proxy, configure its trusted client-IP handling in `lib/api.ts`.

## Resume uploads and deletion

Approve the maximum retention policy, then set `RESUME_MAX_RETENTION_DAYS` (the blueprint suggests 90; it is deliberately not assumed). Leaving this empty disables optional resume uploads, while the application form remains usable. Privacy text reflects the configured period. Review the entire notice with the company, including application-data retention and the contact channel, before publication.

The browser requests a signed upload URL after validation, honeypot checks and rate limiting, uploads directly to private Supabase Storage, then submits an opaque upload ticket with the application. The server downloads and checks size and file signature before committing the application. Bucket limits enforce type and size on direct upload. Upload tickets are one-use, expire after two hours, and are committed atomically with the application. Abandoned files are cleaned after expiration. File-signature checks are not malware scanning; configure a scanning/quarantine service if required by your operational policy.

“Reviewed” sets a ten-day deadline. Unticking cancels that review deadline; the maximum retention deadline still applies. Application data remains. Deletion claims prevent a review toggle from racing an in-progress purge. Downloads are authorized against the caller’s RLS-scoped application and receive 60-second signed links; every request is audited.

1. Set `PURGE_SECRET` in Supabase Edge Function secrets to a long random value (separate from the service key).
2. Deploy: `supabase functions deploy purge-resumes`. `supabase/config.toml` disables JWT verification because this scheduled endpoint authenticates its own `x-purge-secret` header.
3. In Supabase Vault, create `svg_project_url` and `svg_purge_secret`. The latter must match `PURGE_SECRET`.
4. Run `supabase/schedule.sql` once to schedule the daily purge at 02:15 UTC. Inspect `cron.job_run_details`, `net._http_response` and Edge Function logs for failures. Each invocation processes up to 100 due files; increase frequency for larger volume.
5. On a staging project, upload a test resume, tick Reviewed, verify its deadline, untick and verify cancellation. Tick again, backdate the deadline through the SQL editor, run the purge, and verify Storage deletion, `resume_path=null`, `resume_deleted_at`, audit record, and disabled download. Never backdate real applicants’ records for testing.

## Validation and deployment

Run `npm run lint`, `npx tsc --noEmit`, `npm run build`, and the test commands documented in `package.json`. Deploy on Vercel with the same environment variables and your production `APP_URL`. Restart/redeploy after changing public environment variables.

Local tests cannot certify a project that has not yet been connected. Before launch verify the full application/upload/admin/purge flow against your Supabase project, RLS for anonymous/admin/two different recruiter accounts, the rate limiter, and the cron job. No deployment or remote database changes have been performed by this implementation.

Reference documentation used: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [signed uploads](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl), [GSAP standard license](https://gsap.com/community/standard-license/). GSAP’s current no-charge license permits this website use; retain package license notices and recheck before launch.
