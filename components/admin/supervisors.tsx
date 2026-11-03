"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
type Account = { id: string; email: string };
async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}
export function Supervisors() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function load() {
    const data = await request("/api/admin/supervisors");
    setAccounts(data.supervisors);
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      void load().catch((e) => setError(e.message));
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Supervisors</h1>
      <p>Supervisors can view applications and change their status.</p>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <form
        className="grid gap-4 rounded-xl border p-6 md:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = new FormData(form);
          setBusy(true);
          setError("");
          setMessage("");
          try {
            await request("/api/admin/supervisors", {
              method: "POST",
              body: JSON.stringify({
                email: data.get("email"),
                password: data.get("password"),
              }),
            });
            form.reset();
            setMessage("Supervisor created. Sign in at /admin/login.");
            await load();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Email
          <Input name="email" type="email" required autoComplete="off" />
        </label>
        <label>
          Password (12+ characters)
          <Input
            name="password"
            type="password"
            minLength={12}
            maxLength={128}
            required
            autoComplete="new-password"
          />
        </label>
        <Button disabled={busy} className="self-end">
          Create supervisor
        </Button>
      </form>
      <section>
        <h2 className="mb-4 text-xl font-bold">Supervisor accounts</h2>
        {accounts.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-4 border-b py-4"
          >
            <span>{a.email}</span>
            <Button
              variant="outline"
              disabled={busy}
              onClick={async () => {
                if (
                  !window.confirm(
                    `Delete supervisor ${a.email}? Their audit history will be preserved.`,
                  )
                )
                  return;
                setBusy(true);
                setError("");
                try {
                  await request("/api/admin/supervisors", {
                    method: "DELETE",
                    body: JSON.stringify({ id: a.id }),
                  });
                  await load();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Delete
            </Button>
          </div>
        ))}
        {!accounts.length && <p>No supervisor accounts.</p>}
      </section>
    </div>
  );
}
