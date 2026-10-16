import db from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

export type SubscriptionTier = "standard" | "elite";

export const TIER_LIMITS: Record<
  SubscriptionTier,
  { maxCategories: number; maxItemsPerCategory: number }
> = {
  standard: { maxCategories: 5, maxItemsPerCategory: 15 },
  elite: { maxCategories: 100, maxItemsPerCategory: 100 },
};

export async function getRestaurantTier(restaurantId: string): Promise<SubscriptionTier> {
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      owner: { select: { isDemo: true, email: true } },
      subscription: { select: { status: true, tier: true } },
    },
  });

  if (
    restaurant?.owner.isDemo ||
    (restaurant?.owner.email ? isAdminEmail(restaurant.owner.email) : false)
  ) {
    return "elite";
  }

  const subscription = restaurant?.subscription;
  if (
    (subscription?.status === "active" || subscription?.status === "trialing") &&
    subscription.tier === "elite"
  ) {
    return "elite";
  }

  return "standard";
}

export async function canAddCategory(restaurantId: string) {
  const tier = await getRestaurantTier(restaurantId);
  const currentCount = await db.category.count({ where: { restaurantId } });
  return {
    allowed: currentCount < TIER_LIMITS[tier].maxCategories,
    tier,
  };
}

export async function canAddMenuItem(restaurantId: string, categoryId: string) {
  const tier = await getRestaurantTier(restaurantId);
  const currentCount = await db.menuItem.count({
    where: { categoryId, category: { restaurantId } },
  });
  return {
    allowed: currentCount < TIER_LIMITS[tier].maxItemsPerCategory,
    tier,
  };
}
