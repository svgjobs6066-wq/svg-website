"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  LayoutDashboard,
  Users,
  LogOut,
  Download,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Wordmark } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Input, Select, fieldClass } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { browserClient } from "@/lib/supabase/client";
import { type Job, departments, statuses } from "@/lib/jobs";
type Application = {
  id: string;
  ref_no: string;
  full_name: string;
  phone: string;
  preferred_location: string;
  qualification: string;
  experience: string | null;
  status: string;
  notes: string | null;
  reviewed: boolean;
  reviewed_at: string | null;
  delete_after: string | null;
  maximum_delete_at: string | null;
  resume_deleted_at: string | null;
  resume_path: string | null;
  created_at: string;
  assigned_to: string | null;
  jobs: { title: string } | null;
};
async function api(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed");
  return result;
}
export function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="flex flex-col justify-between bg-ink p-8 text-white md:p-16">
        <Wordmark light />
        <div className="py-20">
          <p className="mb-5 text-xs font-semibold tracking-widest text-brand-orange">
            SVG / RECRUITMENT
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Good people.
            <br />
            Great possibilities.
          </h1>
          <p className="mt-6 text-white/60">
            The workspace for the team behind every next chapter.
          </p>
        </div>
        <Link href="/" className="flex min-h-11 items-center gap-3 text-sm">
          Back to website <ArrowUpRight size={18} />
        </Link>
      </section>
      <main id="main" className="flex items-center px-6 py-16 md:p-16">
        <form
          className="w-full"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setBusy(true);
            const form = new FormData(e.currentTarget);
            try {
              if (!process.env.NEXT_PUBLIC_SUPABASE_URL)
                throw new Error(
                  "Add your Supabase settings to .env.local to enable sign-in.",
                );
              const db = browserClient();
              const { error } = await db.auth.signInWithPassword({
                email: String(form.get("email")),
                password: String(form.get("password")),
              });
              if (error)
                throw new Error(
                  "Could not sign in. Check your email and password.",
                );
              await api("/api/admin/stats");
              router.push("/admin");
              router.refresh();
            } catch (error) {
              setError(
                error instanceof Error ? error.message : "Sign-in failed",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="mb-4 text-xs font-bold tracking-widest text-brand-blue">
            TEAM ACCESS
          </p>
          <h2 className="text-3xl font-bold">Welcome back.</h2>
          <p className="mb-8 mt-3 text-sm text-brand-grey">
            Sign in to manage applications and openings.
          </p>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold">
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
          <label
            htmlFor="password"
            className="mb-2 mt-6 block text-sm font-semibold"
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          {error && (
            <p role="alert" className="mt-5 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button disabled={busy} className="mt-8 w-full">
            {busy ? "Signing in…" : "Sign in"}
            <ArrowUpRight size={18} />
          </Button>
          <p className="mt-5 text-xs leading-6 text-brand-grey">
            Access is restricted to authorized SVG administrators and
            recruiters.
          </p>
        </form>
      </main>
    </div>
  );
}
const blankJob: Job = {
  id: "",
  slug: "",
  title: "",
  department: "Machining",
  highlight: "",
  location: "",
  job_type: "",
  eligibility: "",
  status: "active",
};
export function Workspace({
  view,
  role,
}: {
  view: "dashboard" | "applications" | "jobs";
  role: "admin" | "recruiter";
}) {
  const [now, setNow] = useState(0);
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [counts, setCounts] = useState<number[]>([]);
  const [recruiters, setRecruiters] = useState<{ id: string }[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Application | null>(null);
  const [editing, setEditing] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status,
        job: jobFilter,
        date,
        sort,
        page: String(page),
      });
      const [apps, openingData, stats] = await Promise.all([
        api(`/api/admin/applications?${params}`),
        api("/api/admin/jobs"),
        api("/api/admin/stats"),
      ]);
      setNow(Date.now());
      setApplications(apps.applications);
      setTotal(apps.count);
      setJobs(openingData.jobs);
      setCounts(stats.counts);
      setRecruiters(stats.recruiters || []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load data");
    } finally {
      setLoading(false);
    }
  }, [search, status, jobFilter, date, sort, page]);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);
  async function update(id: string, change: Record<string, unknown>) {
    setBusy(true);
    try {
      await api("/api/admin/applications", {
        method: "PATCH",
        body: JSON.stringify({ id, ...change }),
      });
      await load();
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }
  async function download(id: string) {
    setBusy(true);
    try {
      const result = await api("/api/admin/resume-url", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      const a = document.createElement("a");
      a.href = result.url;
      a.rel = "noreferrer";
      a.click();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy(false);
    }
  }
  function resumeCell(a: Application) {
    if (a.resume_deleted_at)
      return <span className="text-brand-grey">Resume deleted</span>;
    if (!a.resume_path)
      return <span className="text-brand-grey">No resume</span>;
    const dates = [a.delete_after, a.maximum_delete_at]
      .filter(Boolean)
      .map((d) => new Date(d!).getTime());
    const days = dates.length
      ? Math.max(0, Math.ceil((Math.min(...dates) - now) / 86400000))
      : null;
    return (
      <div>
        <button
          disabled={busy}
          onClick={() => download(a.id)}
          className="flex min-h-11 items-center gap-2 font-semibold text-brand-blue"
        >
          <Download size={14} />
          Download
        </button>
        {days !== null && (
          <p className="text-[11px] text-amber-800">
            {days === 0 ? "Deletion pending" : `Deletes in ${days} days`}
          </p>
        )}
      </div>
    );
  }
  const nav = [
    {
      key: "dashboard",
      href: "/admin",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      key: "applications",
      href: "/admin/applications",
      label: "Applications",
      icon: Users,
    },
    {
      key: "jobs",
      href: "/admin/jobs",
      label: "Openings",
      icon: BriefcaseBusiness,
    },
  ];
  return (
    <div className="min-h-screen bg-paper">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-ink/10 bg-white px-4 py-5 md:px-8 xl:px-12">
        <Wordmark />
        <div className="flex items-center gap-4 text-xs">
          <span className="rounded-full bg-paper px-3 py-2 capitalize">
            {role}
          </span>
          <button
            className="flex min-h-11 items-center gap-2"
            onClick={async () => {
              await browserClient().auth.signOut();
              router.replace("/admin/login");
              router.refresh();
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>
      <div className="grid lg:grid-cols-[230px_1fr]">
        <aside className="border-b border-ink/10 bg-white p-4 lg:min-h-[calc(100vh-94px)] lg:border-r">
          <nav className="flex flex-wrap gap-2 lg:flex-col">
            {nav.map(({ key, href, label, icon: Icon }) => (
              <Link
                key={key}
                href={href}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold ${view === key ? "bg-blue-50 text-brand-blue" : "text-brand-grey hover:bg-paper"}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="mt-6 hidden min-h-11 items-center gap-2 px-4 text-xs text-brand-grey lg:flex"
          >
            View website
            <ArrowUpRight size={14} />
          </Link>
        </aside>
        <main id="main" className="min-w-0 p-4 md:p-8 xl:p-12">
          <p className="mb-3 text-xs font-semibold tracking-widest text-brand-blue">
            RECRUITMENT WORKSPACE
          </p>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {view === "dashboard"
                  ? "A view of what’s next."
                  : view === "applications"
                    ? "Your next great people."
                    : "Make room for talent."}
              </h1>
              <p className="mt-3 text-sm text-brand-grey">
                {role === "recruiter"
                  ? "Showing applications assigned to you."
                  : "Manage the people and opportunities moving SVG forward."}
              </p>
            </div>
            {view === "applications" && role === "admin" && (
              <Button asChild variant="outline">
                <a href="/api/admin/export">
                  <Download size={16} />
                  Export all CSV
                </a>
              </Button>
            )}
            {view === "jobs" && role === "admin" && (
              <Button onClick={() => setEditing({ ...blankJob })}>
                <Plus size={17} />
                Add opening
              </Button>
            )}
          </div>
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-800"
            >
              {error}
              <button className="ml-4 underline" onClick={() => void load()}>
                Retry
              </button>
            </div>
          )}
          {view === "dashboard" && (
            <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                "New",
                "Reviewed",
                "Shortlisted",
                "Selected",
                "Resumes pending deletion",
              ].map((label, i) => (
                <div
                  key={label}
                  className="rounded-2xl border border-ink/10 bg-white p-6"
                >
                  <p className="text-xs text-brand-grey">{label}</p>
                  <p className="mt-5 text-4xl font-bold text-brand-blue">
                    {counts.length ? counts[i] : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
          {view !== "jobs" && (
            <>
              <div className="mb-5 flex flex-wrap gap-3">
                <div className="relative grow">
                  <Search
                    size={16}
                    className="absolute left-4 top-4 text-brand-grey"
                  />
                  <Input
                    aria-label="Search applications"
                    placeholder="Search name, phone or reference"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                    className="pl-11"
                  />
                </div>
                <Select
                  aria-label="Filter by job"
                  className="w-auto"
                  value={jobFilter}
                  onChange={(e) => {
                    setJobFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="">All jobs</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </Select>
                <Select
                  aria-label="Filter by status"
                  className="w-auto"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="">All statuses</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replaceAll("_", " ")}
                    </option>
                  ))}
                </Select>
                <Input
                  aria-label="Filter by date"
                  type="date"
                  className="w-auto"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setPage(0);
                  }}
                />
                <Select
                  aria-label="Sort applications"
                  className="w-auto"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </Select>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
                <table className="w-full whitespace-nowrap text-left text-xs">
                  <thead className="border-b bg-paper text-brand-grey">
                    <tr>
                      {[
                        "Reference",
                        "Name / phone",
                        "Job",
                        "Location",
                        "Qualification",
                        "Date",
                        "Status",
                        "Reviewed",
                        "Resume",
                      ].map((h) => (
                        <th key={h} className="px-4 py-4 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((a) => (
                      <tr key={a.id} className="border-b border-ink/5">
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setSelected({ ...a })}
                            className="min-h-11 font-semibold text-brand-blue underline underline-offset-4"
                          >
                            {a.ref_no}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setSelected({ ...a })}
                            className="min-h-11 font-semibold"
                          >
                            {a.full_name}
                          </button>
                          <p className="mt-1 text-brand-grey">{a.phone}</p>
                        </td>
                        <td className="px-4 py-4">
                          {a.jobs?.title || "Any suitable role"}
                        </td>
                        <td className="px-4 py-4">{a.preferred_location}</td>
                        <td className="px-4 py-4">{a.qualification}</td>
                        <td className="px-4 py-4">
                          {new Date(a.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-2 capitalize text-brand-blue">
                            {a.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <label className="flex min-h-11 min-w-11 items-center">
                            <input
                              type="checkbox"
                              className="size-5 accent-brand-blue"
                              aria-label={`Mark ${a.full_name} reviewed`}
                              checked={a.reviewed}
                              disabled={busy}
                              onChange={(e) =>
                                void update(a.id, {
                                  reviewed: e.target.checked,
                                })
                              }
                            />
                          </label>
                        </td>
                        <td className="px-4 py-4">{resumeCell(a)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!applications.length && (
                  <p className="px-6 py-16 text-center text-sm text-brand-grey">
                    {loading
                      ? "Loading applications…"
                      : "No applications match these filters."}
                  </p>
                )}
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-brand-grey">
                <p>
                  {total} applications · Page {page + 1}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    aria-label="Previous page"
                    disabled={page === 0 || loading}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    aria-label="Next page"
                    disabled={(page + 1) * 50 >= total || loading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}
          {view === "jobs" && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((j) => (
                <article
                  key={j.id}
                  className="rounded-2xl border border-ink/10 bg-white p-6"
                >
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-brand-grey">{j.department}</span>
                    <span
                      className={`rounded-full px-3 py-2 ${j.status === "active" ? "bg-green-50 text-green-800" : "bg-paper text-brand-grey"}`}
                    >
                      {j.status}
                    </span>
                  </div>
                  <h2 className="mt-6 text-xl font-bold">{j.title}</h2>
                  <p className="mt-3 text-sm text-brand-grey">{j.highlight}</p>
                  <p className="mt-5 text-xs text-brand-grey">
                    {j.location || "Location to be confirmed"}
                  </p>
                  {role === "admin" && (
                    <Button
                      onClick={() => setEditing({ ...j })}
                      variant="outline"
                      className="mt-6 w-full"
                    >
                      Edit opening
                      <ArrowUpRight size={16} />
                    </Button>
                  )}
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
      <Sheet
        open={!!selected}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
        title={selected?.ref_no || "Application"}
      >
        {selected && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{selected.full_name}</h2>
              <p className="mt-2 text-brand-grey">
                {selected.jobs?.title || "Any suitable role"}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-5 text-sm">
              {[
                ["Phone", selected.phone],
                ["Location", selected.preferred_location],
                ["Qualification", selected.qualification],
                ["Experience", selected.experience || "Not provided"],
                [
                  "Applied",
                  new Date(selected.created_at).toLocaleString("en-IN"),
                ],
                [
                  "Reviewed",
                  selected.reviewed_at
                    ? new Date(selected.reviewed_at).toLocaleString("en-IN")
                    : "Not yet",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-brand-grey">{label}</dt>
                  <dd className="mt-2">{value}</dd>
                </div>
              ))}
            </dl>
            {resumeCell(selected)}
            <label className="block text-sm">
              Status
              <Select
                value={selected.status}
                onChange={(e) =>
                  setSelected({ ...selected, status: e.target.value })
                }
                className="mt-2"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-sm">
              Recruiter notes
              <textarea
                className={`${fieldClass} mt-2 min-h-32`}
                maxLength={5000}
                value={selected.notes || ""}
                onChange={(e) =>
                  setSelected({ ...selected, notes: e.target.value })
                }
              />
            </label>
            {role === "admin" && (
              <label className="block text-sm">
                Assigned recruiter
                <Select
                  className="mt-2"
                  value={selected.assigned_to || ""}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      assigned_to: e.target.value || null,
                    })
                  }
                >
                  <option value="">Unassigned</option>
                  {recruiters.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id}
                    </option>
                  ))}
                </Select>
              </label>
            )}
            <Button
              disabled={busy}
              className="w-full"
              onClick={() =>
                void update(selected.id, {
                  status: selected.status,
                  notes: selected.notes || "",
                  ...(role === "admin"
                    ? { assigned_to: selected.assigned_to }
                    : {}),
                })
              }
            >
              {busy ? "Saving…" : "Save changes"}
            </Button>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
          </div>
        )}
      </Sheet>
      <Sheet
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
        title={editing?.id ? "Edit opening" : "Add opening"}
      >
        {editing && (
          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const { id, ...job } = editing;
                await api("/api/admin/jobs", {
                  method: "POST",
                  body: JSON.stringify({
                    ...job,
                    ...(id ? { id } : {}),
                    created_at: undefined,
                  }),
                });
                setEditing(null);
                await load();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not save job");
              } finally {
                setBusy(false);
              }
            }}
          >
            {(
              [
                "title",
                "slug",
                "highlight",
                "location",
                "job_type",
                "eligibility",
              ] as const
            ).map((key) => (
              <label key={key} className="block text-sm capitalize">
                {key.replaceAll("_", " ")}
                <Input
                  className="mt-2"
                  value={editing[key] || ""}
                  required={["title", "slug"].includes(key)}
                  onChange={(e) =>
                    setEditing({ ...editing, [key]: e.target.value })
                  }
                />
              </label>
            ))}
            <label className="block text-sm">
              Department
              <Select
                className="mt-2"
                value={editing.department}
                onChange={(e) =>
                  setEditing({ ...editing, department: e.target.value })
                }
              >
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </label>
            <label className="block text-sm">
              Status
              <Select
                className="mt-2"
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value })
                }
              >
                {["active", "paused", "closed"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <Button disabled={busy} className="w-full">
              {busy ? "Saving…" : "Save opening"}
            </Button>
          </form>
        )}
      </Sheet>
    </div>
  );
}
