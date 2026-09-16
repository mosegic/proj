import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { verifyPaystackTransaction } from "@/lib/paystack";

function inferTier(transaction: Awaited<ReturnType<typeof verifyPaystackTransaction>>) {
  if (transaction.metadata?.tier === "elite") return "elite";

  const elitePlanCodes = [
    process.env.PAYSTACK_ELITE_MONTHLY_PLAN_CODE,
    process.env.PAYSTACK_ELITE_ANNUAL_PLAN_CODE,
  ];
  return transaction.plan?.plan_code && elitePlanCodes.includes(transaction.plan.plan_code)
    ? "elite"
    : "standard";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reference } = await params;
  let transaction;

  try {
    transaction = await verifyPaystackTransaction(reference);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify payment with Paystack";
    console.error("Paystack transaction verification failed", { reference, message });
    return NextResponse.json(
      { error: `Transaction could not be verified: ${message}` },
      { status: 502 },
    );
  }

  if (transaction.status !== "success") {
    return NextResponse.json({ error: "Payment was not successful" }, { status: 400 });
  }

  let subscription = await db.subscription.findUnique({
    where: { transactionReference: reference },
    include: { restaurant: true },
  });

  if (!subscription && transaction.reference !== reference) {
    subscription = await db.subscription.findUnique({
      where: { transactionReference: transaction.reference },
      include: { restaurant: true },
    });
  }

  if (!subscription && transaction.subscription?.subscription_code) {
    subscription = await db.subscription.findFirst({
      where: { subscriptionCode: transaction.subscription.subscription_code },
      include: { restaurant: true },
    });
  }

  // Recover a payment if checkout succeeded but the initialize request could not
  // persist its pending subscription row.
  if (!subscription && transaction.metadata?.restaurantId) {
    const restaurant = await db.restaurant.findUnique({
      where: { id: transaction.metadata.restaurantId },
    });
    if (restaurant) {
      subscription = await db.subscription.upsert({
        where: { restaurantId: restaurant.id },
        create: {
          restaurantId: restaurant.id,
          status: "pending",
          tier: inferTier(transaction),
          planCode: transaction.plan?.plan_code || "paystack-recovered",
          email: transaction.customer.email,
          transactionReference: transaction.reference,
        },
        update: {
          transactionReference: transaction.reference,
          tier: inferTier(transaction),
          planCode: transaction.plan?.plan_code || undefined,
        },
        include: { restaurant: true },
      });
    }
  }

  if (!subscription) {
    console.error("Paystack verification succeeded but no local subscription matched", {
      requestedReference: reference,
      paystackReference: transaction.reference,
      subscriptionCode: transaction.subscription?.subscription_code,
      restaurantId: transaction.metadata?.restaurantId,
    });
    return NextResponse.json(
      {
        error:
          "Payment was verified, but the restaurant subscription could not be matched. Contact support with this payment reference.",
        reference: transaction.reference,
      },
      { status: 404 },
    );
  }

  if (subscription.restaurant.ownerId !== session.userId) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  try {
    const updated = await db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "active",
        customerCode: transaction.customer.customer_code,
        subscriptionCode: transaction.subscription?.subscription_code,
        authorizationCode: transaction.authorization?.authorization_code,
        amount: transaction.amount,
        currency: transaction.currency,
        nextPaymentDate: transaction.subscription?.next_payment_date
          ? new Date(transaction.subscription.next_payment_date)
          : null,
      },
    });
    return NextResponse.json({ subscription: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save payment";
    console.error("Failed to finalize Paystack transaction", { reference, message });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
