"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(pathname !== "/dashboard/billing");

  useEffect(() => {
    if (pathname === "/dashboard/billing") {
      setChecking(false);
      return;
    }

    let cancelled = false;
    fetch("/api/paystack/status")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to check subscription");
        return response.json();
      })
      .then(({ subscription }) => {
        if (!cancelled && subscription?.status !== "active" && subscription?.status !== "trialing") {
          router.replace("/dashboard/billing");
          return;
        }
        if (!cancelled) setChecking(false);
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checking) {
    return <div className="animate-pulse h-64 rounded-lg bg-gray-100" />;
  }

  return children;
}
