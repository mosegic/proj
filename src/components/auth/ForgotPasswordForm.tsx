"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { readJsonResponse, responseError } from "@/lib/client-api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await readJsonResponse(res);
    if (res.ok) {
      setSubmitted(true);
    } else {
      setError(responseError(data, "Something went wrong. Please try again."));
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
        If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset
        link. Check your inbox (and spam folder).
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" loading={loading} className="w-full">
        Send Reset Link
      </Button>
    </form>
  );
}
