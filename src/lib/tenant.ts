import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function getOwnedRestaurant(restaurantId: string) {
  const session = await getSession();
  if (!session) return null;

  return db.restaurant.findFirst({
    where: { id: restaurantId, ownerId: session.userId },
  });
}

export async function getUserRestaurants() {
  const session = await getSession();
  if (!session) return [];

  return db.restaurant.findMany({
    where: { ownerId: session.userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRestaurantBySlug(slug: string) {
  return db.restaurant.findUnique({
    where: { slug, isActive: true },
    include: {
      categories: {
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            where: { isVisible: true },
            orderBy: { sortOrder: "asc" },
            include: { options: true },
          },
        },
      },
    },
  });
}

export function getMenuUrl(slug: string, tableNumber?: number): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (tableNumber) {
    return `${base}/menu/${slug}/table/${tableNumber}`;
  }
  return `${base}/menu/${slug}`;
}
