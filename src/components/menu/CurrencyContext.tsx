"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type MenuCurrency = "KES" | "USD";

type CurrencyContextValue = {
  currency: MenuCurrency;
  setCurrency: (currency: MenuCurrency) => void;
  usdRate: number | null;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<MenuCurrency>("KES");
  const [usdRate, setUsdRate] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/currency")
      .then(async (response) => {
        if (!response.ok) throw new Error("Exchange rates unavailable");
        return response.json() as Promise<{ rates?: { USD?: number } }>;
      })
      .then((data) => {
        if (typeof data.rates?.USD === "number" && data.rates.USD > 0) {
          setUsdRate(data.rates.USD);
        }
      })
      .catch(() => {
        // Keep KES available when the optional exchange-rate service is unavailable.
      });
  }, []);

  const value = useMemo(
    () => ({ currency, setCurrency, usdRate }),
    [currency, usdRate],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useMenuCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useMenuCurrency must be used inside CurrencyProvider");
  return context;
}
