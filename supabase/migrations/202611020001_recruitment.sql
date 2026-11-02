create extension if not exists pgcrypto;
create table public.profiles (id uuid primary key references auth.users on delete cascade, role text not null check (role in ('admin','recruiter')));
create table public.jobs (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, department text not null, location text, job_type text, highlight text, eligibility text, status text not null default 'active' check (status in ('active','paused','closed')), created_at timestamptz not null default now());
create table public.applications (
 id uuid primary key default gen_random_uuid(), ref_no text unique not null default ('SVG-' || upper(encode(gen_random_bytes(5),'hex'))), full_name text not null, phone text not null check (phone ~ '^[6-9][0-9]{9}$'), job_id uuid references public.jobs(id), preferred_location text not null, qualification text not null, experience text, consent_version text not null,
 resume_path text, status text not null default 'new' check(status in ('new','contacted','shortlisted','interview','selected','joined','not_selected','withdrawn')), notes text, assigned_to uuid references public.profiles(id), reviewed boolean not null default false, reviewed_at timestamptz, delete_after timestamptz, maximum_delete_at timestamptz, resume_deleted_at timestamptz, purge_started_at timestamptz, created_at timestamptz not null default now()
);
create unique index applications_phone_job on public.applications(phone, coalesce(job_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index applications_deletion on public.applications(delete_after) where resume_path is not null;
create index applications_assignee on public.applications(assigned_to);
create table public.audit_logs(id bigint generated always as identity primary key, actor uuid, application_id uuid references public.applications(id), action text not null, detail jsonb, created_at timestamptz not null default now());
create table public.upload_intents(id uuid primary key, application_id uuid unique not null, path text unique not null, size integer not null check(size > 0 and size <= 5242880), mime text not null, expires_at timestamptz not null default now() + interval '2 hours', consumed_at timestamptz, created_at timestamptz not null default now());
create table public.rate_limits(key text primary key, hits integer not null default 1, window_start timestamptz not null default now());
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.upload_intents enable row level security;
alter table public.rate_limits enable row level security;
create function public.staff_role() returns text language sql stable security definer set search_path = '' as $$ select role from public.profiles where id = (select auth.uid()) $$;
revoke all on function public.staff_role() from public;
grant execute on function public.staff_role() to authenticated;
create policy own_profile on public.profiles for select to authenticated using (id = (select auth.uid()) or (select public.staff_role()) = 'admin');
create policy public_active_jobs on public.jobs for select to anon using (status = 'active');
create policy authenticated_jobs on public.jobs for select to authenticated using (status = 'active' or (select public.staff_role()) in ('admin','recruiter'));
create policy admin_jobs on public.jobs for all to authenticated using ((select public.staff_role()) = 'admin') with check ((select public.staff_role()) = 'admin');
create policy staff_applications on public.applications for select to authenticated using ((select public.staff_role()) = 'admin' or ((select public.staff_role()) = 'recruiter' and assigned_to = (select auth.uid())));
create policy staff_update on public.applications for update to authenticated using ((select public.staff_role()) = 'admin' or ((select public.staff_role()) = 'recruiter' and assigned_to = (select auth.uid()))) with check ((select public.staff_role()) = 'admin' or ((select public.staff_role()) = 'recruiter' and assigned_to = (select auth.uid())));
create policy admin_audit on public.audit_logs for select to authenticated using ((select public.staff_role()) = 'admin');
revoke all on public.applications, public.upload_intents, public.rate_limits, public.audit_logs, public.profiles from anon, authenticated;
grant select on public.profiles, public.applications, public.audit_logs to authenticated;
grant update(status, notes, reviewed) on public.applications to authenticated;
grant select on public.jobs to anon, authenticated;
grant insert, update, delete on public.jobs to authenticated;

create function public.set_delete_after() returns trigger language plpgsql set search_path = '' as $$ begin
 if old.purge_started_at is not null and new.reviewed is distinct from old.reviewed then raise exception 'Resume deletion is in progress. Refresh and retry.'; end if;
 if new.reviewed and not old.reviewed then new.reviewed_at := now(); new.delete_after := now() + interval '10 days'; elsif not new.reviewed then new.reviewed_at := null; new.delete_after := null; end if; return new; end $$;
create trigger trg_set_delete_after before update of reviewed on public.applications for each row execute function public.set_delete_after();
create function public.audit_application_update() returns trigger language plpgsql security definer set search_path = '' as $$ begin
 if new.status is distinct from old.status or new.reviewed is distinct from old.reviewed or new.notes is distinct from old.notes or new.assigned_to is distinct from old.assigned_to then
 insert into public.audit_logs(actor, application_id, action, detail) values(auth.uid(),new.id,'application_updated',jsonb_build_object('old_status',old.status,'status',new.status,'reviewed',new.reviewed,'notes_changed',new.notes is distinct from old.notes,'assigned_to',new.assigned_to)); end if; return new; end $$;
create trigger trg_audit_application after update on public.applications for each row execute function public.audit_application_update();
create function public.consume_rate_limit(p_key text) returns boolean language plpgsql security definer set search_path = '' as $$ declare n integer; begin
 insert into public.rate_limits(key) values(p_key) on conflict(key) do update set hits = case when public.rate_limits.window_start < now()-interval '1 hour' then 1 else public.rate_limits.hits+1 end, window_start = case when public.rate_limits.window_start < now()-interval '1 hour' then now() else public.rate_limits.window_start end returning hits into n; return n <= 10; end $$;
create function public.submit_application(p_id uuid,p_name text,p_phone text,p_job uuid,p_location text,p_qualification text,p_experience text,p_resume text,p_ticket uuid,p_retention_days integer) returns text language plpgsql security definer set search_path = '' as $$ declare ref text; begin
 if p_job is not null and not exists(select 1 from public.jobs where id=p_job and status='active') then raise exception 'Job is not active'; end if;
 if p_resume is not null then
  if p_retention_days < 1 or p_retention_days > 365 then raise exception 'Invalid retention'; end if;
  update public.upload_intents set consumed_at=now() where id=p_ticket and application_id=p_id and path=p_resume and consumed_at is null and expires_at>now();
  if not found then raise exception 'Invalid or consumed upload'; end if;
 end if;
 insert into public.applications(id,full_name,phone,job_id,preferred_location,qualification,experience,consent_version,resume_path,maximum_delete_at) values(p_id,p_name,p_phone,p_job,p_location,p_qualification,p_experience,'2026-11-v1',p_resume,case when p_resume is not null then now()+make_interval(days=>p_retention_days) else null end) returning ref_no into ref; return ref; end $$;
create function public.claim_resume_purge() returns setof public.applications language plpgsql security definer set search_path = '' as $$ begin
 return query update public.applications a set purge_started_at=now() where a.id in (select id from public.applications where resume_path is not null and (delete_after<=now() or maximum_delete_at<=now()) and (purge_started_at is null or purge_started_at<now()-interval '15 minutes') order by created_at for update skip locked limit 100) returning a.*; end $$;
create function public.assign_application(p_id uuid,p_assignee uuid) returns void language plpgsql security definer set search_path = '' as $$ begin
 if public.staff_role() is distinct from 'admin' then raise exception 'Forbidden'; end if;
 if p_assignee is not null and not exists(select 1 from public.profiles where id=p_assignee and role='recruiter') then raise exception 'Invalid recruiter'; end if;
 update public.applications set assigned_to=p_assignee where id=p_id; end $$;
revoke all on function public.consume_rate_limit(text), public.submit_application(uuid,text,text,uuid,text,text,text,text,uuid,integer), public.claim_resume_purge(), public.assign_application(uuid,uuid) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text), public.submit_application(uuid,text,text,uuid,text,text,text,text,uuid,integer), public.claim_resume_purge() to service_role;
grant execute on function public.assign_application(uuid,uuid) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('resumes','resumes',false,5242880,array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']) on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
-- No public Storage policies: uploads and downloads use server-issued signed URLs.
insert into public.jobs(slug,title,department,highlight) values
('cnc-machine-operator','CNC Machine Operator','Machining','Precision part production'),
('vmc-machine-operator','VMC Machine Operator','Machining','Vertical machining centre'),
('hmc-machine-operator','HMC Machine Operator','Machining','Horizontal machining centre'),
('lathe-operator','Lathe Operator','Machining','Turning and finishing'),
('laser-machine-operator','Laser Machine Operator','Fabrication','Sheet cutting'),
('cnc-bending-machine-operator','CNC Bending Machine Operator','Fabrication','Accurate sheet bends'),
('powder-coating-operator','Powder Coating Operator','Finishing','Quality surface finish'),
('assembly-technician','Assembly Technician','Assembly','Build and fit assemblies'),
('accounts','Accounts','Office','Books and billing'),('purchase','Purchase','Office','Sourcing and vendors');
