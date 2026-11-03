begin;
create function public.manual_deletion_enabled() returns boolean language sql as $$ select true $$;
revoke all on function public.manual_deletion_enabled() from public,anon,authenticated;
grant execute on function public.manual_deletion_enabled() to service_role;
drop trigger if exists trg_set_delete_after on public.applications;
revoke update(reviewed) on public.applications from authenticated;
create or replace function public.claim_resume_purge() returns setof public.applications language sql security definer set search_path='' as $$ select * from public.applications where false $$;
update public.applications set delete_after=null,maximum_delete_at=null,purge_started_at=null;
update public.audit_logs l set detail=coalesce(l.detail,'{}'::jsonb)||jsonb_build_object('reference',a.ref_no) from public.applications a where l.application_id=a.id;
create or replace function public.audit_application_update() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if new.status is distinct from old.status or new.notes is distinct from old.notes or new.assigned_to is distinct from old.assigned_to then
 insert into public.audit_logs(actor,application_id,action,detail) values(auth.uid(),new.id,'application_updated',jsonb_build_object('reference',new.ref_no,'actor_email',(select email from auth.users where id=auth.uid()),'actor_role',public.staff_role(),'old_status',old.status,'status',new.status,'notes_changed',new.notes is distinct from old.notes,'assigned_to',new.assigned_to));
 end if; return new; end $$;
create function public.clear_resume_schedule() returns trigger language plpgsql set search_path='' as $$ begin
 new.delete_after:=null; new.maximum_delete_at:=null; new.purge_started_at:=null; return new;
end $$;
create trigger clear_resume_schedule before insert or update on public.applications for each row execute function public.clear_resume_schedule();
alter table public.audit_logs drop constraint audit_logs_application_id_fkey;
alter table public.audit_logs add constraint audit_logs_application_id_fkey foreign key(application_id) references public.applications(id) on delete set null;
create function public.delete_applications_manually(p_ids uuid[],p_actor uuid) returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 if not exists(select 1 from public.profiles where id=p_actor and role='admin') then raise exception 'Admin access required'; end if;
 if coalesce(array_length(p_ids,1),0) not between 1 and 50 then raise exception 'Select 1 to 50 applications'; end if;
 perform id from public.applications where id=any(p_ids) for update;
 update public.audit_logs l set detail=coalesce(l.detail,'{}'::jsonb)||jsonb_build_object('reference',a.ref_no,'application_deleted',true) from public.applications a where l.application_id=a.id and a.id=any(p_ids);
 insert into public.audit_logs(actor,application_id,action,detail) select p_actor,id,'application_deleted',jsonb_build_object('reference',ref_no,'actor_email',(select email from auth.users where id=p_actor),'actor_role','admin','application_deleted',true) from public.applications where id=any(p_ids);
 delete from public.upload_intents where application_id=any(p_ids);
 delete from public.applications where id=any(p_ids);
 get diagnostics n=row_count; return n;
end $$;
revoke all on function public.delete_applications_manually(uuid[],uuid) from public,anon,authenticated;
grant execute on function public.delete_applications_manually(uuid[],uuid) to service_role;
-- Disable the old schedule even if the old Edge Function is still deployed.
do $$ begin
 if exists(select 1 from pg_namespace where nspname='cron') then
  execute 'select cron.unschedule(jobid) from cron.job where jobname = ''svg-purge-resumes''';
 end if;
end $$;
commit;
