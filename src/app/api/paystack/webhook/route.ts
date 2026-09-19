import { NextResponse } from "next/server";
import db from "@/lib/db";
import { inferPaystackTier, isPaystackWebhookValid, PaystackTransaction } from "@/lib/paystack";

export async function POST(request: Request) {
  const payload = await request.text();
  if (!isPaystackWebhookValid(payload, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload) as {
    event: string;
    data: PaystackTransaction & {
      subscription?: { subscription_code: string; next_payment_date: string };
    };
  };
  if (event.event === "charge.success" && event.data.reference) {
    const subscription = await db.subscription.findFirst({
      where: {
        OR: [
          { transactionReference: event.data.reference },
          ...(event.data.subscription?.subscription_code
            ? [{ subscriptionCode: event.data.subscription.subscription_code }]
            : []),
        ],
      },
    });
    if (subscription) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "active",
          tier: inferPaystackTier(event.data),
          customerCode: event.data.customer?.customer_code,
          subscriptionCode: event.data.subscription?.subscription_code,
          authorizationCode: event.data.authorization?.authorization_code,
          amount: event.data.amount,
          currency: event.data.currency,
          nextPaymentDate: event.data.subscription?.next_payment_date
            ? new Date(event.data.subscription.next_payment_date)
            : undefined,
        },
      });
    }
  } else if (
    event.event === "invoice.payment_failed" &&
    event.data.subscription?.subscription_code
  ) {
    await db.subscription.updateMany({
      where: { subscriptionCode: event.data.subscription.subscription_code },
      data: { status: "past_due" },
    });
  } else if (event.event === "subscription.disable" && event.data.subscription?.subscription_code) {
    await db.subscription.updateMany({
      where: { subscriptionCode: event.data.subscription.subscription_code },
      data: { status: "cancelled" },
    });
  }

  return NextResponse.json({ received: true });
}
