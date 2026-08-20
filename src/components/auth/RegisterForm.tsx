"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { slugify } from "@/lib/validations";

const THEME_PRESETS = [
  { name: "Ocean Blue", theme: "#2563eb", accent: "#1e40af" },
  { name: "Forest Green", theme: "#16a34a", accent: "#15803d" },
  { name: "Sunset Orange", theme: "#ea580c", accent: "#c2410c" },
  { name: "Royal Purple", theme: "#9333ea", accent: "#7e22ce" },
  { name: "Classic Red", theme: "#dc2626", accent: "#b91c1c" },
];

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    slug: "",
    description: "",
    themeColor: "#2563eb",
    accentColor: "#1e40af",
    logoUrl: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "businessName" && !prev.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Account</h2>
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            minLength={8}
          />
          <Button type="button" onClick={() => setStep(2)} className="w-full">
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Business</h2>
          <Input
            label="Business Name"
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            required
          />
          <Input
            label="Menu URL"
            value={form.slug}
            onChange={(e) => update("slug", slugify(e.target.value))}
            required
            placeholder="my-cafe"
          />
          <p className="text-xs text-gray-500">
            Your menu will be at: /menu/{form.slug || "your-slug"}
          </p>
          <Input
            label="Description (optional)"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
          <Input
            label="Logo URL (optional)"
            value={form.logoUrl}
            onChange={(e) => update("logoUrl", e.target.value)}
            placeholder="https://..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-5 gap-2">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  title={preset.name}
                  onClick={() => {
                    update("themeColor", preset.theme);
                    update("accentColor", preset.accent);
                  }}
                  className={`h-10 rounded-lg border-2 transition-all ${
                    form.themeColor === preset.theme
                      ? "border-gray-900 scale-105"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: preset.theme }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Create Account
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
