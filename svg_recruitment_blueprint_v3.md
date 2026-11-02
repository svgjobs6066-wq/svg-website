
# SVG Recruitment Website — Blueprint v3

**Client:** Sree Vijeyaganapathi & Co. (SVG)
**Goal:** Turn visitors into completed Careers-page applications.
**Pages:** Home (`/`) + Careers (`/careers`) + Admin (`/admin`)
**Languages:** English (default) + Tamil toggle
**Approach:** Mobile-first, modern, flat design, animation-rich (GSAP)

---

## 1. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | **Tailwind CSS v4 only** (utilities + `@theme` tokens; no CSS modules, no custom CSS files) |
| UI kit | **shadcn/ui** (Button, Input, Select, Checkbox, Accordion, Sheet, Dialog, Table, Badge, Form) + react-hook-form + zod |
| Backend | **Supabase**: Postgres (form data), Storage (resumes), Auth (admin) |
| Animation | **GSAP** + `@gsap/react` (ScrollTrigger, SplitText, Flip, Observer, Draggable, DrawSVG) |
| Icons | lucide-react |
| Hosting | Vercel + Supabase |

> GSAP plugins (incl. SplitText, DrawSVG) are free in recent versions. Confirm the current license before launch.

---

## 2. Design rules

- **Match the logo.** Flat colors only.
- **No gradients. Anywhere.** Solid fills, borders, flat shapes.
- **No `max-w-*`.** Layouts are full width: `w-full` with responsive padding (`px-4 md:px-8 xl:px-16`) and fluid grids.
- **Mobile-first.** Write base styles for phones, then `md:` and `xl:`.
- Big bold type, solid color blocks, rounded corners, generous whitespace, real photos of the shop floor.
- Min tap target 44px. WCAG contrast. Visible focus.

### Brand tokens (sample exact values from the logo file)

| Token | Approx. hex | Use |
|---|---|---|
| `brand-blue` | `#0F75BC` | Primary, buttons, headings |
| `brand-orange` | `#F58220` | Accents, highlights, hover |
| `brand-green` | `#4CAF50` | Success, secondary accents |
| `brand-grey` | `#5A5A5A` | Body text, footer |
| `ink` | `#1E2A36` | Dark sections |
| `paper` | `#F5F7FA` | Light sections |
| `white` | `#FFFFFF` | Cards, form |

```css
/* app/globals.css */
@import "tailwindcss";
@theme {
  --color-brand-blue: #0F75BC;
  --color-brand-orange: #F58220;
  --color-brand-green: #4CAF50;
  --color-brand-grey: #5A5A5A;
  --color-ink: #1E2A36;
  --color-paper: #F5F7FA;
}
```

**Fonts:** Poppins or Plus Jakarta Sans (EN), Noto Sans Tamil (TA).

---

## 3. Sitemap

| Route | Purpose |
|---|---|
| `/` | Home: brand, roles, qualifications, testimonials, FAQ |
| `/careers` | All openings + **the application form** |
| `/careers?job=cnc-machine-operator` | Same page, job prefilled |
| `/privacy`, `/terms` | Legal |
| `/admin/login` | Admin sign-in |
| `/admin` | Dashboard |
| `/admin/applications` | Forms + resumes |
| `/admin/jobs` | Manage openings |

**Rule:** Every Apply / Register / I'm Interested button on Home goes to **`/careers`** (with the job prefilled when it comes from a job card). The form lives only on Careers.

---

## 4. Openings (seed data)

| # | Role | Dept | Card highlight |
|---|---|---|---|
| 1 | CNC Machine Operator | Machining | Precision part production |
| 2 | VMC Machine Operator | Machining | Vertical machining centre |
| 3 | HMC Machine Operator | Machining | Horizontal machining centre |
| 4 | Lathe Operator | Machining | Turning and finishing |
| 5 | Laser Machine Operator | Fabrication | Sheet cutting |
| 6 | CNC Bending Machine Operator | Fabrication | Accurate sheet bends |
| 7 | Powder Coating Operator | Finishing | Quality surface finish |
| 8 | Assembly Technician | Assembly | Build and fit assemblies |
| 9 | Accounts | Office | Books and billing |
| 10 | Purchase | Office | Sourcing and vendors |

Add location, job type and eligibility per role in admin. Confirm highlights with the client. No salary figures publicly.

---

## 5. Home page (`/`)

| # | Section | Content |
|---|---|---|
| 01 | **Header** | Logo · Roles · Qualifications · Stories · FAQ · EN/தமிழ் · **Careers** button |
| 02 | **Hero** | Headline: **"Make things. Build a career."** Sub: *Open roles in machining, fabrication, assembly and office.* CTA: **View Careers**. Big spinning logo-mark shape, floating role chips |
| 03 | **Roles marquee** | Endless scrolling strip of all 10 role names |
| 04 | **All qualifications band** | **"Every qualification has a place."** Chips: **10th · 12th · ITI · Diploma · Any Degree**. Line: *Work is available for all.* CTA: **See Openings** → `/careers`. (One band only. Jobs are not grouped by qualification.) |
| 05 | **Openings preview** | 10 role cards, each with highlight + **Apply →** to `/careers?job=slug` |
| 06 | **How it works** | 1 Apply on Careers → 2 We call you → 3 Documents & joining (if shortlisted). Animated connecting line |
| 07 | **Testimonials** | Real, consented quotes from employees/candidates: photo, name, role. Draggable slider. *If none verified, hide the section.* |
| 08 | **FAQ** | 6 short Q&As (degree needed, freshers, salary, resume, free, guarantee) |
| 09 | **Final CTA band** | Solid blue band: **"Ready to start?"** · **Apply on Careers** |
| 10 | **Footer** | Real company details, Privacy, Terms, social |

**Mobile:** sticky bottom **Apply Now** bar linking to `/careers`.

**Testimonial rules:** no invented people, quotes or ratings. Written consent required.

---

## 6. Careers page (`/careers`)

| # | Section | Content |
|---|---|---|
| 01 | Header | Same as Home |
| 02 | Hero | **"Find your role at SVG."** Short line + anchor to form |
| 03 | **Filters** | Chips: All · Machining · Fabrication · Assembly · Finishing · Office (animated with GSAP Flip) |
| 04 | **Openings list** | Cards with **Select** → fills the form job field and scrolls to it |
| 05 | **Application form** | See below |
| 06 | Success state | **"You're registered!"** + reference number `SVG-XXXXXX` |
| 07 | Mini FAQ + footer | 3 questions |

### Application form

| Field | Required | Notes |
|---|---|---|
| Full name | ✅ | |
| Mobile number | ✅ | Indian mobile validation |
| Job applying for | ✅ | Active jobs + "Any suitable role" |
| Preferred location | ✅ | |
| Qualification | ✅ | 10th, 12th, ITI, Diploma, Any Degree, Other |
| Experience | Optional | Fresher, 0–1, 1–3, 3+ yrs |
| **Resume upload** | Optional | PDF / DOC / DOCX, max 5 MB |
| Consent | ✅ | Contact + resume storage, unchecked by default |

**Button:** **Send My Application**
**Microcopy:** *We'll contact you after review.*

Don't ask for Aadhaar, PAN or bank details here. Do not promise jobs or response times.

---

## 7. Supabase

### 7.1 Tables

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('admin','recruiter'))
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  department text not null,
  location text,
  job_type text,
  highlight text,
  eligibility text,
  status text not null default 'active' check (status in ('active','paused','closed')),
  created_at timestamptz default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  ref_no text unique not null,
  full_name text not null,
  phone text not null,
  job_id uuid references jobs(id),
  preferred_location text,
  qualification text,
  experience text,
  consent_version text not null,
  resume_path text,                 -- storage path, null after deletion
  status text not null default 'new',
  notes text,
  reviewed boolean not null default false,   -- the "tick"
  reviewed_at timestamptz,
  delete_after timestamptz,
  resume_deleted_at timestamptz,
  created_at timestamptz default now()
);

create index on applications (delete_after) where resume_path is not null;
```

### 7.2 Storage

- Private bucket: `resumes`. No public policies.
- Path: `resumes/{application_id}/{random}.pdf`.
- Server route issues a **signed upload URL** after validating type and size.
- Admins download via **signed URL (60 s expiry)**.

### 7.3 Security (RLS)

- RLS **on** for all tables.
- Public can read **active jobs only**.
- Applications are inserted by a **server route** (service role) with validation, rate limiting, bot protection and duplicate check (same phone + job). No public read of applications.
- Admin/recruiter policies check `profiles.role`. Recruiters see assigned applications only.
- Audit log for resume downloads and status changes.

---

## 8. Resume retention: tick → delete in 10 days

**Flow**
1. Admin opens an application, downloads the resume if needed.
2. Admin **ticks "Reviewed"**.
3. System sets `reviewed_at = now()` and `delete_after = now() + 10 days`.
4. Admin UI shows **"Resume deletes in N days"**. Unticking cancels the timer.
5. A **daily scheduled job** deletes the file and nulls `resume_path`.
6. Application data stays. Only the resume is removed. Download button changes to "Resume deleted".

```sql
create or replace function set_delete_after() returns trigger as $$
begin
  if new.reviewed and not old.reviewed then
    new.reviewed_at := now();
    new.delete_after := now() + interval '10 days';
  elsif not new.reviewed then
    new.reviewed_at := null;
    new.delete_after := null;
  end if;
  return new;
end $$ language plpgsql;

create trigger trg_set_delete_after
before update of reviewed on applications
for each row execute function set_delete_after();
```

**Purge job (Supabase Edge Function `purge-resumes`, scheduled daily with `pg_cron` + `pg_net`)**
- Select rows where `delete_after <= now()` and `resume_path is not null`.
- Remove the file through the Storage API (not by deleting rows in `storage.objects`).
- Update `resume_path = null`, `resume_deleted_at = now()`.
- Log the result.

**Also decide with the client:** a maximum retention for resumes that are never ticked (suggest 90 days). Cover this in the Privacy notice.

---

## 9. Admin panel

- **Login:** Supabase Auth (email + password, optional MFA). Role from `profiles`.
- **Dashboard:** real counts: New · Reviewed · Shortlisted · Selected · Resumes pending deletion.
- **Applications table (shadcn Table):**
  - Columns: Ref · Name · Phone · Job · Location · Qualification · Date · Status · **Reviewed ✓** · **Resume**
  - Search, filter (job, status, date), sort.
  - **Resume column:** `Download` button, or `Deletes in N days`, or `Deleted`.
  - Detail drawer (Sheet): all fields, notes, status change.
  - CSV export for admins.
- **Jobs:** add, edit, pause, close. Only active jobs appear on the site.
- **Statuses:** New → Contacted → Shortlisted → Interview → Selected → Joined (or Not Selected / Withdrawn).

---

## 10. GSAP animation plan

Use `useGSAP()` for scoping and cleanup, and `gsap.matchMedia()` to split mobile/desktop and reduced-motion.

| Where | Animation |
|---|---|
| Hero headline | **SplitText** line/char rise-in with stagger |
| Hero logo-mark | Continuous slow rotation + scroll-linked spin (ScrollTrigger scrub) |
| Floating chips | Gentle looping float, slight pointer parallax (desktop) |
| Roles marquee | Infinite loop; **Observer** speeds up and reverses with scroll direction |
| Qualification chips | Pop-in with elastic ease, hover wiggle |
| Job cards | Staggered slide-up on scroll; hover lift + orange underline wipe |
| Mobile job rail | Horizontal scroll cards with snap |
| How it works | **DrawSVG** line connects steps as you scroll; step numbers count in |
| Testimonials | **Draggable** slider with inertia |
| Section transitions | Flat color wipe panels (blue / orange / green) |
| **Page transition** `/` ⇄ `/careers` | Three solid color panels sweep across, then reveal the next page |
| Careers filters | **Flip** re-orders and animates cards when a chip is clicked |
| Form | Field focus underline animation, progress bar that fills, shake on error |
| Success | Check mark draws itself, reference number types in |
| Buttons (desktop) | Magnetic pull on hover |

**Rules:** transform/opacity only; no layout thrash; `prefers-reduced-motion` disables non-essential motion; animation never blocks the form.

---

## 11. Localization

- English default, **EN | தமிழ்** toggle in header.
- Switching keeps filled form values and selected job.
- All text lives in `lib/i18n/en.ts` and `ta.ts`.
- Tamil must be human-reviewed before launch.

---

## 12. Structure

```text
src/
  app/
    page.tsx
    careers/page.tsx
    privacy/page.tsx
    terms/page.tsx
    admin/
      login/page.tsx
      page.tsx
      applications/page.tsx
      jobs/page.tsx
    api/
      applications/route.ts      # validate, insert, signed upload URL
      admin/resume-url/route.ts  # signed download URL + audit log
  components/
    ui/                          # shadcn
    layout/ Header.tsx Footer.tsx StickyApply.tsx PageTransition.tsx
    home/ Hero.tsx RolesMarquee.tsx QualificationBand.tsx JobsPreview.tsx
          HowItWorks.tsx Testimonials.tsx Faq.tsx FinalCta.tsx
    careers/ Filters.tsx JobList.tsx ApplicationForm.tsx SuccessCard.tsx
    admin/ ApplicationsTable.tsx ResumeCell.tsx StatCards.tsx
  lib/
    supabase/ client.ts server.ts admin.ts
    i18n/ en.ts ta.ts
    validation.ts
supabase/
  migrations/
  functions/purge-resumes/
```

---

## 13. Content rules

**Do:** show real jobs, real testimonials (with consent), real contact details, clear privacy notice.
**Don't:** promise guaranteed jobs/salary/bonus, invent reviews or numbers, show salary amounts, use fake urgency, collect ID or bank documents on the form.

---

## 14. Launch checklist

- [ ] Logo colors sampled and tokens set
- [ ] Real jobs, locations and eligibility entered
- [ ] Testimonials collected with consent (or section hidden)
- [ ] Form → Supabase tested end to end, job prefill works from Home cards
- [ ] Every Home CTA goes to `/careers`
- [ ] Resume upload limits and file types enforced server-side
- [ ] Tick → `delete_after` set → purge job removes the file (tested)
- [ ] Admin download works with expiring links; RLS verified
- [ ] Privacy notice and retention periods approved
- [ ] No gradients, no `max-w` anywhere (search the codebase)
- [ ] Mobile, accessibility, speed and reduced-motion tested
- [ ] Tamil reviewed

---

## 15. Build brief (copy-ready)

> Build a modern, mobile-first recruitment website for Sree Vijeyaganapathi & Co. using Next.js, TypeScript, Tailwind CSS v4 only, shadcn/ui and Supabase. Match the SVG logo palette (blue, orange, green, grey) with flat colors only: no gradients and no max-w classes. Pages: Home (hero, roles marquee, one all-qualifications band for 10th/12th/ITI/Diploma/Any Degree, openings preview, how it works, testimonials, FAQ, CTA) and Careers (filters, openings list, application form). Every apply button on Home navigates to /careers with the job prefilled. Roles: CNC, VMC, HMC machine operator, Assembly Technician, Lathe Operator, Laser Machine Operator, CNC Bending Machine Operator, Powder Coating Operator, Accounts, Purchase. Store form data and resumes in Supabase (private bucket, signed URLs). Build an admin panel to view applications, download resumes and tick "Reviewed"; ticking schedules the resume for automatic deletion after 10 days via a daily purge job. Use rich GSAP animation (SplitText, ScrollTrigger, Flip, Observer, Draggable, DrawSVG, page-transition wipes) with reduced-motion support. English default with Tamil toggle.
