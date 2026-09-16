"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type DemoUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  restaurants: { name: string; slug: string }[];
};

export function AdminPanel() {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [form, setForm] = useState({ name: "", email: "", restaurantName: "" });
  const [result, setResult] = useState<{ email: string; password: string; slug: string } | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    const response = await fetch("/api/admin/demo-users");
    if (!response.ok) {
      setMessage("Unable to load test accounts");
      setLoading(false);
      return;
    }
    const data = await response.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/demo-users")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load test accounts");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setMessage("Unable to load test accounts");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setResult(null);
    const response = await fetch("/api/admin/demo-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to create account");
      return;
    }
    setResult({
      email: data.user.email,
      password: data.password,
      slug: data.user.restaurant.slug,
    });
    setForm({ name: "", email: "", restaurantName: "" });
    await loadUsers();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Admin</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Elite testing accounts</h1>
          <p className="mt-2 text-gray-600">
            Generated accounts are marked as demo users and inherit Elite features without Paystack billing.
          </p>
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Generate account</h2>
          <form onSubmit={createUser} className="mt-4 grid gap-3 sm:grid-cols-3">
            <Input label="Name" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} required onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Restaurant name" value={form.restaurantName} onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} />
            <Button type="submit" className="sm:col-span-3">Generate Elite test account</Button>
          </form>
          {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
          {result && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Save these credentials now. The password is shown only once.</p>
              <p className="mt-2">Email: <code>{result.email}</code></p>
              <p>Password: <code>{result.password}</code></p>
              <p>Menu: <code>/menu/{result.slug}</code></p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Generated accounts</h2>
          {loading ? <p className="mt-3 text-sm text-gray-500">Loading...</p> : (
            <div className="mt-4 divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user.id} className="py-3 text-sm">
                  <p className="font-medium text-gray-900">{user.name} · {user.email}</p>
                  <p className="text-gray-500">{user.restaurants[0]?.name || "No restaurant"} · created {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
              {users.length === 0 && <p className="text-sm text-gray-500">No generated accounts yet.</p>}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
