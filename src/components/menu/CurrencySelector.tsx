"use client";

import { useMenuCurrency } from "./CurrencyContext";

export function CurrencySelector() {
  const { currency, setCurrency, usdRate } = useMenuCurrency();

  return (
    <label className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium">
      <span>Prices:</span>
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value as "KES" | "USD")}
        className="rounded-full bg-transparent font-semibold outline-none"
        aria-label="Choose menu currency"
      >
        <option value="KES" className="text-gray-900">KES</option>
        <option value="USD" disabled={!usdRate} className="text-gray-900">
          USD{usdRate ? "" : " (unavailable)"}
        </option>
      </select>
    </label>
  );
}
