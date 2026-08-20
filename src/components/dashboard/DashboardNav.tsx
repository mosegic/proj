"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface DashboardNavProps {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    themeColor: string;
  };
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/categories", label: "Categories", icon: "📁" },
  { href: "/dashboard/menu", label: "Menu Items", icon: "🍽️" },
  { href: "/dashboard/tables", label: "Tables & QR", icon: "📱" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export function DashboardNav({ restaurant }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
        <nav className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center px-2 py-1 text-xs ${
                pathname === item.href ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label.split(" ")[0]}
            </Link>
          ))}
        </nav>
      </div>

      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: restaurant.themeColor }}
            >
              {restaurant.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 truncate">{restaurant.name}</h2>
              <p className="text-xs text-gray-500">/{restaurant.slug}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            href={`/menu/${restaurant.slug}`}
            target="_blank"
            className="block text-sm text-blue-600 hover:underline text-center"
          >
            View Public Menu →
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full">
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
