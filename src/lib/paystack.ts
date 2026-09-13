import { createHmac } from "node:crypto";

const PAYSTACK_API_URL = "https://api.paystack.co";

export interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaystackTransaction {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  customer: { email: string; customer_code: string };
  authorization?: { authorization_code: string };
  plan?: { plan_code: string };
  subscription?: { subscription_code: string; next_payment_date: string };
}

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

async function paystackRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${PAYSTACK_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = (await response.json()) as PaystackResponse<T>;
  if (!response.ok || !body.status) {
    throw new Error(body.message || "Paystack request failed");
  }
  return body.data;
}

export function getPaystackPlanCode() {
  const planCode = process.env.PAYSTACK_PLAN_CODE;
  if (!planCode) throw new Error("PAYSTACK_PLAN_CODE is not configured");
  return planCode;
}

export function getPaystackCallbackUrl() {
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing`;
}

export function initializePaystackTransaction(payload: {
  email: string;
  reference: string;
  plan: string;
  callback_url: string;
  metadata: { restaurantId: string };
}) {
  return paystackRequest<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyPaystackTransaction(reference: string) {
  return paystackRequest<PaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

export function isPaystackWebhookValid(payload: string, signature: string | null) {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  return createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex") === signature;
}
