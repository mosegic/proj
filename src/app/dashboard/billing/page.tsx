"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Subscription = {
  status: string;
  nextPaymentDate: string | null;
  currency: string;
  amount: number | null;
};

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference");
    const verify = reference
      ? fetch(`/api/paystack/verify/${encodeURIComponent(reference)}`)
      : Promise.resolve(new Response(null, { status: 204 }));

    verify
      .then(async (response) => {
        if (reference && !response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Unable to verify payment");
        }
        return fetch("/api/paystack/status");
      })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load billing status");
        return response.json();
      })
      .then((data) => setSubscription(data.subscription))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchParams]);

  async function subscribe() {
    setError("");
    const response = await fetch("/api/paystack/initialize", { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to start subscription");
      return;
    }
    window.location.href = data.authorizationUrl;
  }

  if (loading) return <div className="animate-pulse h-40 rounded-lg bg-gray-100" />;
  const active = subscription?.status === "active";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-600">Manage your MenuSaaS subscription.</p>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm font-medium text-gray-500">Current plan</p>
        <p className="mt-1 text-xl font-semibold text-gray-900">
          {active ? "Active subscription" : "No active subscription"}
        </p>
        {active && subscription?.nextPaymentDate && (
          <p className="mt-2 text-sm text-gray-600">
            Next payment: {new Date(subscription.nextPaymentDate).toLocaleDateString()}
          </p>
        )}
        {!active && (
          <Button className="mt-4" onClick={subscribe}>Subscribe with Paystack</Button>
        )}
      </section>
    </div>
  );
}
