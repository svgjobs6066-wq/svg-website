-- Disable the retired automatic deletion schedule.
do $$ begin
 if exists(select 1 from pg_namespace where nspname='cron') then
 execute 'select cron.unschedule(jobid) from cron.job where jobname = ''svg-purge-resumes''';
 end if;
end $$;
