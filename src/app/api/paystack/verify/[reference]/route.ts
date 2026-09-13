import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reference } = await params;
  const subscription = await db.subscription.findUnique({
    where: { transactionReference: reference },
    include: { restaurant: true },
  });
  if (!subscription || subscription.restaurant.ownerId !== session.userId) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  try {
    const transaction = await verifyPaystackTransaction(reference);
    if (transaction.status !== "success") {
      return NextResponse.json({ error: "Payment was not successful" }, { status: 400 });
    }

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
    const message = error instanceof Error ? error.message : "Unable to verify payment";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
