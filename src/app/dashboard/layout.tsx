import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserRestaurants } from "@/lib/tenant";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const restaurants = await getUserRestaurants();
  if (restaurants.length === 0) redirect("/register");

  const restaurant = restaurants[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav restaurant={restaurant} />
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
