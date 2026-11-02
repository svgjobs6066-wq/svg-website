# Create the Supabase resume bucket

The website stores resumes in a **private bucket named `resumes`**. The application uses Supabase for database, storage and admin authentication. No Cloudflare setup is needed.

## 1. Apply the project migration first (recommended)

Creating a bucket alone is not enough: the form also needs the application tables and database functions.

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor** and create a new query.
3. Copy the complete contents of [`supabase/migrations/202611020001_recruitment.sql`](./supabase/migrations/202611020001_recruitment.sql).
4. Run it **once** against your project. It creates the recruitment tables, access rules, ten jobs, rate limiter, retention functions **and the `resumes` bucket**.
5. Open **Storage** and confirm that `resumes` exists and is private.

If you already applied this migration, do not run the full file again. Continue to step 2 to verify the bucket. The bucket-specific SQL in step 3 is safe to run again.

## 2. Create or check the bucket in the dashboard

If `resumes` already exists, open its settings. Otherwise, in **Storage**, choose **New bucket** and enter these settings:

| Setting | Value |
| --- | --- |
| Name / ID | `resumes` (exactly, lowercase) |
| Public bucket | **OFF** |
| Maximum file size | **5 MB** (5,242,880 bytes) |
| Allowed MIME types | The three values below |

```text
application/pdf
application/msword
application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

Save the settings. If the creation dialog does not show upload restrictions, configure them in the bucket settings after creation, or use the SQL below. Supabase supports bucket-level size and MIME restrictions. [Official bucket creation guide](https://supabase.com/docs/guides/storage/buckets/creating-buckets).

## 3. Alternative: create or update only the bucket with SQL

Run this in **SQL Editor** if you prefer to set all bucket options at once. It does not create the application tables.

```sql
insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'resumes',
  'resumes',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
```

Check the result:

```sql
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'resumes';
```

Expected: `public = false`, `file_size_limit = 5242880` and the three MIME types.

## 4. Keep resume access private

Do **not** add a public SELECT, INSERT, UPDATE or DELETE policy for this bucket. Do not switch it to public to fix an upload error.

The application server checks requests and issues signed upload URLs. Authorized administrators and assigned recruiters receive signed download links that expire after 60 seconds. Private buckets support expiring signed access. [Official access-model guide](https://supabase.com/docs/guides/storage/buckets/fundamentals).

If this project already has broad Storage policies, review whether any also cover `resumes`:

```sql
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects';
```

No broad public policy should grant access to resumes. The application migration creates no such policies. Do not remove unrelated policies used by other buckets.

## 5. Fill `.env.local`

Use [`.env.example`](./.env.example) as your template. Keep your existing real credentials when adding the missing settings:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
APP_URL=http://localhost:3000
RATE_LIMIT_SECRET=YOUR_RANDOM_SECRET

# Set your approved maximum resume retention in days.
# Example only, if you approve 90 days:
RESUME_MAX_RETENTION_DAYS=90
```

Find the project URL and API keys in your project's Connect/API settings. Use the public anon key for `NEXT_PUBLIC_SUPABASE_ANON_KEY` and the server-only service-role key for `SUPABASE_SERVICE_ROLE_KEY`. Never put the service-role key in a `NEXT_PUBLIC_` variable or browser code.

Generate a value for `RATE_LIMIT_SECRET` locally:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `.env.local`. The bucket name is already `resumes` in the code; no bucket environment variable is needed. Leaving `RESUME_MAX_RETENTION_DAYS` blank intentionally disables optional resume uploads until the retention period is decided.

Restart the site after changing environment settings:

```powershell
npm run dev
```

For deployment, add the same settings in Vercel, use your production website origin for `APP_URL`, and redeploy.

## 6. Test one application

1. Visit `/careers` and complete the required fields.
2. Select a valid PDF, DOC or DOCX resume smaller than 5 MB and give consent.
3. Submit the form. A saved application shows an `SVG-…` reference.
4. In Supabase **Table Editor → applications**, confirm the row and `resume_path`.
5. In **Storage → resumes**, confirm the file exists under an application UUID folder. The application creates folders automatically; do not create another nested `resumes` folder.
6. Sign in at `/admin/login` with a user assigned an `admin` profile as explained in [SETUP.md](./SETUP.md). Open the application and test Download.

The files use this structure:

```text
resumes (bucket)
  APPLICATION_UUID/
    RANDOM_UUID.pdf
```

## 7. Enable automatic deletion

The bucket does not delete files automatically by itself. Complete the **Resume uploads and deletion** section of [SETUP.md](./SETUP.md): deploy `purge-resumes`, configure `PURGE_SECRET` and the Vault secrets, then run [`supabase/schedule.sql`](./supabase/schedule.sql).

Marking an application Reviewed schedules resume deletion after ten days. Unmarking it cancels that timer. The approved maximum retention still applies. Only the resume file is removed; the application record stays.

## Troubleshooting

| Issue | Check |
| --- | --- |
| `PGRST205` or missing `jobs` / `applications` table | Apply the full recruitment migration in step 1. |
| Resume upload is not shown | Set an approved `RESUME_MAX_RETENTION_DAYS` and restart. |
| Bucket not found | Name must be exactly `resumes` in the same project as your environment URL. |
| Applications temporarily unavailable | Check `RATE_LIMIT_SECRET`, Supabase credentials and the migration. |
| Invalid request origin | `APP_URL` must match the browser origin, including the local port. |
| File rejected | Check extension, MIME type, file signature and the 5 MB limit. |
| Download denied | Sign in with an admin or an assigned recruiter account; keep the bucket private. |
| Reviewed resume not deleted | Deploy and schedule the purge function; inspect its logs and cron results. |

The honeypot and database rate limits provide basic abuse controls. They are not a CAPTCHA or a proof that a visitor is human.
