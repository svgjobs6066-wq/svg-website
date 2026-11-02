-- Run after deploying the Edge Function and storing these Vault secrets:
-- svg_project_url = https://YOUR_PROJECT.supabase.co
-- svg_purge_secret = same secret as PURGE_SECRET in Edge Function secrets
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule('svg-purge-resumes','15 2 * * *', $$
 select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name='svg_project_url') || '/functions/v1/purge-resumes',
  headers := jsonb_build_object('Content-Type','application/json','x-purge-secret',(select decrypted_secret from vault.decrypted_secrets where name='svg_purge_secret')),
  body := '{}'::jsonb,
  timeout_milliseconds := 120000
 );
$$);
