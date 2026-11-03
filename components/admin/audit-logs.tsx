"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { statuses } from "@/lib/jobs";
type Log = {
  id: number;
  application_id: string | null;
  actor: string | null;
  action: string;
  created_at: string;
  detail: {
    reference?: string;
    actor_email?: string;
    actor_role?: string;
    old_status?: string;
    status?: string;
    reviewed?: boolean;
    notes_changed?: boolean;
    assigned_to?: string | null;
  } | null;
  applications: { ref_no: string; full_name: string } | null;
};
const defaults = {
  search: "",
  actor: "",
  action: "",
  status: "",
  from: "",
  to: "",
};
const label = (s: string) => s.replaceAll("_", " ");
export function AuditLogs() {
  const [filters, setFilters] = useState(defaults),
    [page, setPage] = useState(0),
    [rows, setRows] = useState<Log[]>([]),
    [count, setCount] = useState(0),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      const id = new URLSearchParams(window.location.search).get("application");
      setApplication(id);
      const params = new URLSearchParams({ ...filters, page: String(page) });
      if (id) params.set("application", id);
      try {
        const response = await fetch(`/api/admin/audit?${params}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setRows(data.logs);
        setCount(data.count || 0);
      } catch (e) {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error ? e.message : "Could not load audit logs.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters, page]);
  function change(key: keyof typeof defaults, value: string) {
    setPage(0);
    setFilters((f) => ({ ...f, [key]: value }));
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit logs</h1>
        <p className="mt-3 text-sm text-brand-grey">
          Track who changed an application and when. Select an SVG reference to
          view the full application.
        </p>
      </div>
      {application && (
        <div className="flex items-center gap-4">
          <p>Showing one application’s history.</p>
          <Button
            variant="outline"
            onClick={() => {
              window.history.replaceState(null, "", "/admin/logs");
              setPage(0);
              setFilters({ ...defaults });
            }}
          >
            Show all applications
          </Button>
        </div>
      )}
      <div className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm">
          Search reference or applicant
          <Input
            placeholder="SVG reference or name"
            value={filters.search}
            onChange={(e) => change("search", e.target.value)}
          />
        </label>
        <label className="text-sm">
          Changed by
          <Input
            placeholder="Staff email"
            value={filters.actor}
            onChange={(e) => change("actor", e.target.value)}
          />
        </label>
        <label className="text-sm">
          Action
          <Select
            value={filters.action}
            onChange={(e) => change("action", e.target.value)}
          >
            <option value="">All actions</option>
            {[
              "application_updated",
              "application_deleted",
              "resume_download",
              "applications_csv_export",
            ].map((v) => (
              <option key={v} value={v}>
                {label(v)}
              </option>
            ))}
          </Select>
        </label>
        <label className="text-sm">
          Resulting status
          <Select
            value={filters.status}
            onChange={(e) => change("status", e.target.value)}
          >
            <option value="">All statuses</option>
            {statuses.map((v) => (
              <option key={v} value={v}>
                {label(v)}
              </option>
            ))}
          </Select>
        </label>
        <label className="text-sm">
          From date (UTC)
          <Input
            type="date"
            value={filters.from}
            onChange={(e) => change("from", e.target.value)}
          />
        </label>
        <label className="text-sm">
          To date (UTC)
          <Input
            type="date"
            value={filters.to}
            onChange={(e) => change("to", e.target.value)}
          />
        </label>
        <Button
          variant="outline"
          onClick={() => {
            setPage(0);
            setFilters({ ...defaults });
          }}
        >
          Clear filters
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <div
        className="overflow-x-auto rounded-xl border bg-white"
        aria-busy={loading}
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-paper">
            <tr>
              {[
                "Date & time",
                "SVG reference",
                "Applicant",
                "Changed by",
                "Action",
                "Details",
              ].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-4 py-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  Loading audit logs…
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="whitespace-nowrap p-4">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {row.application_id && row.applications ? (
                      <Link
                        className="whitespace-nowrap font-semibold text-brand-blue underline"
                        href={`/admin/applications?application=${row.application_id}`}
                      >
                        {row.applications.ref_no}
                      </Link>
                    ) : row.detail?.reference ? (
                      `${row.detail.reference} (deleted)`
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4">{row.applications?.full_name || "—"}</td>
                  <td className="p-4">
                    {row.detail?.actor_email || row.actor || "System"}
                    <p className="text-xs text-brand-grey">
                      {row.detail?.actor_role}
                    </p>
                  </td>
                  <td className="p-4 capitalize">{label(row.action)}</td>
                  <td className="min-w-52 p-4">
                    <p>
                      {row.detail?.old_status &&
                      row.detail.status &&
                      row.detail.old_status !== row.detail.status
                        ? `${label(row.detail.old_status)} → ${label(row.detail.status)}`
                        : "—"}
                    </p>
                    {row.detail?.notes_changed && <p>Notes changed</p>}
                  </td>
                </tr>
              ))
            )}
            {!loading && !rows.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  No audit logs match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm">
          {count} events · Page {page + 1} of{" "}
          {Math.max(1, Math.ceil(count / 50))}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={loading || page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={loading || (page + 1) * 50 >= count}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
