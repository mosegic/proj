import "dotenv/config";

/**
 * Creates (or reuses) the four KES subscription plans on Paystack and prints
 * the resulting plan codes to paste into your environment variables
 * (.env.local for development, Vercel Project Settings for production).
 *
 * Usage:
 *   PAYSTACK_SECRET_KEY=sk_test_xxx npx tsx scripts/setup-paystack-plans.ts
 *
 * Run it once per Paystack mode (test vs live) you need plans for — plan
 * codes created in test mode do not exist in live mode and vice versa.
 */

const PAYSTACK_API_URL = "https://api.paystack.co";

type PaidPlan = "standard" | "elite";
type BillingInterval = "monthly" | "annually";

const PLAN_DEFINITIONS: {
  plan: PaidPlan;
  interval: BillingInterval;
  name: string;
  amount: number;
  paystackInterval: string;
  envKey: string;
}[] = [
  {
    plan: "standard",
    interval: "monthly",
    name: "MenuSaaS Standard (Monthly)",
    amount: 150000,
    paystackInterval: "monthly",
    envKey: "PAYSTACK_STANDARD_MONTHLY_PLAN_CODE",
  },
  {
    plan: "standard",
    interval: "annually",
    name: "MenuSaaS Standard (Annual)",
    amount: 1500000,
    paystackInterval: "annually",
    envKey: "PAYSTACK_STANDARD_ANNUAL_PLAN_CODE",
  },
  {
    plan: "elite",
    interval: "monthly",
    name: "MenuSaaS Elite (Monthly)",
    amount: 350000,
    paystackInterval: "monthly",
    envKey: "PAYSTACK_ELITE_MONTHLY_PLAN_CODE",
  },
  {
    plan: "elite",
    interval: "annually",
    name: "MenuSaaS Elite (Annual)",
    amount: 3500000,
    paystackInterval: "annually",
    envKey: "PAYSTACK_ELITE_ANNUAL_PLAN_CODE",
  },
];

type PaystackPlan = {
  plan_code: string;
  name: string;
  amount: number;
  interval: string;
  currency: string;
};

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<{
  status: boolean;
  message: string;
  data: T;
}> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not set in the environment");
  }
  const response = await fetch(`${PAYSTACK_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = (await response.json()) as { status: boolean; message: string; data: T };
  if (!response.ok || !body.status) {
    throw new Error(body.message || `Paystack request to ${path} failed`);
  }
  return body;
}

async function findExistingPlan(name: string, currency: string): Promise<PaystackPlan | undefined> {
  const { data } = await paystackRequest<PaystackPlan[]>(
    `/plan?perPage=100&currency=${currency}`,
  );
  return data.find((p) => p.name === name);
}

async function main() {
  const results: { envKey: string; planCode: string; reused: boolean }[] = [];

  for (const def of PLAN_DEFINITIONS) {
    const existing = await findExistingPlan(def.name, "KES");
    if (existing) {
      results.push({ envKey: def.envKey, planCode: existing.plan_code, reused: true });
      continue;
    }

    const { data } = await paystackRequest<PaystackPlan>("/plan", {
      method: "POST",
      body: JSON.stringify({
        name: def.name,
        amount: def.amount,
        interval: def.paystackInterval,
        currency: "KES",
      }),
    });
    results.push({ envKey: def.envKey, planCode: data.plan_code, reused: false });
  }

  console.log("\nPaystack plans ready. Set these environment variables:\n");
  for (const r of results) {
    console.log(`${r.envKey}=${r.planCode}${r.reused ? "  (already existed, reused)" : "  (created)"}`);
  }
  console.log("\nAdd/update these in .env.local for local dev, and in Vercel Project Settings > Environment Variables (Production) for the live site, then redeploy.");
}

main().catch((error) => {
  console.error("Failed to set up Paystack plans:", error instanceof Error ? error.message : error);
  process.exit(1);
});
