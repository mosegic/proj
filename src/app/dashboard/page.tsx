import { getUserRestaurants } from "@/lib/tenant";
import Link from "next/link";

export default async function DashboardPage() {
  const restaurants = await getUserRestaurants();
  const restaurant = restaurants[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s your restaurant overview.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/categories"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">📁</span>
          <h3 className="mt-2 font-semibold text-gray-900">Categories</h3>
          <p className="text-sm text-gray-500">Organize your menu</p>
        </Link>
        <Link
          href="/dashboard/menu"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">🍽️</span>
          <h3 className="mt-2 font-semibold text-gray-900">Menu Items</h3>
          <p className="text-sm text-gray-500">Manage dishes & pricing</p>
        </Link>
        <Link
          href="/dashboard/tables"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">📱</span>
          <h3 className="mt-2 font-semibold text-gray-900">QR Codes</h3>
          <p className="text-sm text-gray-500">Generate table QR codes</p>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-2">Your Public Menu</h3>
        <p className="text-sm text-gray-600 mb-3">
          Share this link with customers or scan a table QR code.
        </p>
        <a
          href={`/menu/${restaurant.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
        >
          /menu/{restaurant.slug} →
        </a>
      </div>
    </div>
  );
}
