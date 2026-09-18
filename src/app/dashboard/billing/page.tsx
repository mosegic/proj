"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { readJsonResponse, responseError } from "@/lib/client-api";

type Subscription = {
  status: string;
  tier: string;
  planCode: string;
  trialEndsAt: string | null;
  nextPaymentDate: string | null;
  currency: string;
  amount: number | null;
};

type BillingStatus = {
  subscription: Subscription | null;
  isDemo: boolean;
};

type BillingInterval = "monthly" | "annually";

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const verify = reference
      ? fetch(`/api/paystack/verify/${encodeURIComponent(reference)}`)
      : Promise.resolve(new Response(null, { status: 204 }));

    verify
      .then(async (response) => {
        if (reference && !response.ok) {
          const data = await readJsonResponse<{ authorizationUrl?: string; error?: string }>(response);
          throw new Error(responseError(data, "Unable to verify payment"));
        }
        return fetch("/api/paystack/status");
      })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load billing status");
        return readJsonResponse<BillingStatus>(response);
      })
      .then((data: BillingStatus) => {
        setSubscription(data.subscription);
        setIsDemo(data.isDemo);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchParams]);

  async function subscribe(plan: "standard" | "elite", interval: BillingInterval) {
    setError("");
    setStarting(true);
    const response = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, interval }),
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      setError(responseError(data, "Unable to start subscription"));
      setStarting(false);
      return;
    }
    if (typeof data.authorizationUrl !== "string") {
      setError("Paystack did not return a checkout URL");
      setStarting(false);
      return;
    }
    window.location.href = data.authorizationUrl;
  }

  if (loading) return <div className="animate-pulse h-40 rounded-lg bg-gray-100" />;
  const active = subscription?.status === "active";
  const trialing = subscription?.status === "trialing";
  const standardActive = active && subscription?.tier === "standard";

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1">
          Manage your MenuSaaS subscription and billing preferences.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </p>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Current Plan Overview
        </p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {isDemo
            ? "Demo Account"
            : active
            ? `${subscription?.tier === "elite" ? "Business Elite" : "Business Standard"}`
            : trialing
              ? "Free Trial"
              : "No Active Subscription"}
        </p>
        {trialing && subscription?.trialEndsAt && (
          <p className="mt-2 text-sm text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded-full font-medium">
            Trial ends: {new Date(subscription.trialEndsAt).toLocaleDateString()}
          </p>
        )}
        {active && subscription?.nextPaymentDate && (
          <p className="mt-2 text-sm text-gray-600">
            Next renewal payment:{" "}
            <span className="font-semibold text-gray-900">
              {new Date(subscription.nextPaymentDate).toLocaleDateString()}
            </span>
          </p>
        )}
      </section>

      {!isDemo && (!active || standardActive) && (
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => setBillingInterval("monthly")}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  billingInterval === "monthly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval("annually")}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  billingInterval === "annually"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Annually
              </button>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Save 2 months with annual billing!
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            <PlanCard
              name="Business Standard"
              description="Perfect for growing restaurants and essential features."
              price={billingInterval === "monthly" ? "KES 1,500" : "KES 15,000"}
              interval={billingInterval}
              features={[
                "Full digital menu builder",
                "QR code generation",
                "Standard analytic insights",
              ]}
              disabled={starting || standardActive}
              buttonLabel={standardActive ? "Current plan" : undefined}
              onChoose={() => subscribe("standard", billingInterval)}
            />
            <PlanCard
              name="Business Elite"
              description="Advanced multi-location analytics and customized loyalty tools."
              price={billingInterval === "monthly" ? "KES 3,500" : "KES 35,000"}
              interval={billingInterval}
              features={[
                "Everything in Standard",
                "Multi-location access",
                "Advanced sales reports",
                "Dedicated account support",
              ]}
              highlighted
              disabled={starting}
              buttonLabel={standardActive ? "Upgrade to Elite" : undefined}
              onChoose={() => subscribe("elite", billingInterval)}
            />
          </div>

          <p className="text-center text-xs text-gray-500">
            By subscribing you agree to our{" "}
            <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            . Payments are securely processed by Paystack.
          </p>

        </div>
      )}
    </div>
  );
}

function PlanCard({
  name,
  description,
  price,
  interval,
  features,
  highlighted = false,
  disabled,
  buttonLabel,
  onChoose,
}: {
  name: string;
  description: string;
  price: string;
  interval: BillingInterval;
  features: string[];
  highlighted?: boolean;
  disabled: boolean;
  buttonLabel?: string;
  onChoose: () => void;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl bg-white p-8 transition relative ${
        highlighted
          ? "border-2 border-blue-600 shadow-md hover:shadow-lg ring-4 ring-blue-50"
          : "border border-gray-200 shadow-sm hover:border-gray-300"
      }`}
    >
      {highlighted && (
        <div className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
          Most Popular
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
        <p className="mt-6 flex items-baseline text-gray-900">
          <span className="text-4xl font-extrabold tracking-tight">{price}</span>
          <span className="ml-1 text-sm font-semibold text-gray-500">
            /{interval === "monthly" ? "mo" : "yr"}
          </span>
        </p>
        <ul className="mt-6 space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-6">
          {features.map((feature) => (
            <li key={feature} className="flex items-center">
              <span className="mr-2" aria-hidden="true">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <Button
        className={`mt-8 w-full ${highlighted ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
        disabled={disabled}
        onClick={onChoose}
      >
        {buttonLabel || `Choose ${name.replace("Business ", "")}`}
      </Button>
    </div>
  );
}
