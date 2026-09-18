"use client";

import { useMenuCurrency } from "./CurrencyContext";

type MonetaryValue = string | number | { toString(): string };

export function PriceDisplay({ price }: { price: MonetaryValue }) {
  const { currency, usdRate } = useMenuCurrency();
  const basePrice = typeof price === "string" || typeof price === "number"
    ? Number(price)
    : Number(price.toString());
  const amount = currency === "USD" && usdRate ? basePrice * usdRate : basePrice;

  return (
    <>
      {new Intl.NumberFormat(currency === "KES" ? "en-KE" : "en-US", {
        style: "currency",
        currency,
      }).format(amount)}
    </>
  );
}
