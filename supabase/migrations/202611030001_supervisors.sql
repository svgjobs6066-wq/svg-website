begin;
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check check(role in ('admin','recruiter','supervisor'));
alter table public.applications drop constraint applications_status_check;
update public.applications set status = case status when 'shortlisted' then 'contacted' when 'interview' then 'contacted' when 'joined' then 'selected' when 'not_selected' then 'not_fit' when 'withdrawn' then 'close' else status end;
alter table public.applications add constraint applications_status_check check(status in ('new','contacted','no_response','selected','not_fit','close'));
create policy supervisor_read on public.applications for select to authenticated using (public.staff_role()='supervisor');
create policy supervisor_update on public.applications for update to authenticated using(public.staff_role()='supervisor') with check(public.staff_role()='supervisor');
create function public.limit_supervisor_update() returns trigger language plpgsql set search_path='' as $$ begin
 if public.staff_role()='supervisor' and (to_jsonb(new)-'status') is distinct from (to_jsonb(old)-'status') then raise exception 'Supervisors may only change status'; end if;
 return new;
end $$;
create trigger supervisor_status_only before update on public.applications for each row execute function public.limit_supervisor_update();
create or replace function public.audit_application_update() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if new.status is distinct from old.status or new.reviewed is distinct from old.reviewed or new.notes is distinct from old.notes or new.assigned_to is distinct from old.assigned_to then
 insert into public.audit_logs(actor,application_id,action,detail) values(auth.uid(),new.id,'application_updated',jsonb_build_object('actor_email',(select email from auth.users where id=auth.uid()),'actor_role',public.staff_role(),'old_status',old.status,'status',new.status,'reviewed',new.reviewed,'notes_changed',new.notes is distinct from old.notes,'assigned_to',new.assigned_to));
 end if; return new; end $$;
commit;
