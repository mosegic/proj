"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Subscription = {
  status: string;
  planCode: string;
  trialEndsAt: string | null;
  nextPaymentDate: string | null;
  currency: string;
  amount: number | null;
};

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

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

  async function subscribe(plan: "standard" | "elite", interval: "monthly" | "annually") {
    setError("");
    setStarting(true);
    const response = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, interval }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to start subscription");
      setStarting(false);
      return;
    }
    window.location.href = data.authorizationUrl;
  }

  if (loading) return <div className="animate-pulse h-40 rounded-lg bg-gray-100" />;
  const active = subscription?.status === "active";
  const trialing = subscription?.status === "trialing";

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
          {active
            ? `${subscription?.planCode === "elite" ? "Business Elite" : "Business Standard"} subscription`
            : trialing
              ? "Free trial"
              : "No active subscription"}
        </p>
        {trialing && subscription?.trialEndsAt && (
          <p className="mt-2 text-sm text-gray-600">
            Trial ends: {new Date(subscription.trialEndsAt).toLocaleDateString()}
          </p>
        )}
        {active && subscription?.nextPaymentDate && (
          <p className="mt-2 text-sm text-gray-600">
            Next payment: {new Date(subscription.nextPaymentDate).toLocaleDateString()}
          </p>
        )}
        {!active && !trialing && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="ghost"
                disabled={starting}
                onClick={() =>
                  fetch("/api/paystack/trial", { method: "POST" }).then(() => window.location.reload())
                }
              >
                Start free month
              </Button>
              <Button disabled={starting} onClick={() => subscribe("standard", "monthly")}>
                Standard — ₦15,000/month
              </Button>
              <Button disabled={starting} onClick={() => subscribe("standard", "annually")}>
                Standard — ₦150,000/year
              </Button>
              <Button disabled={starting} onClick={() => subscribe("elite", "monthly")}>
                Elite — ₦45,000/month
              </Button>
              <Button disabled={starting} onClick={() => subscribe("elite", "annually")}>
                Elite — ₦450,000/year
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
