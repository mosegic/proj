import db from "@/lib/db";

export type SubscriptionTier = "standard" | "elite";

export const TIER_LIMITS: Record<
  SubscriptionTier,
  { maxCategories: number; maxItemsPerCategory: number }
> = {
  standard: { maxCategories: 5, maxItemsPerCategory: 15 },
  elite: { maxCategories: Infinity, maxItemsPerCategory: Infinity },
};

export async function getRestaurantTier(restaurantId: string): Promise<SubscriptionTier> {
  const subscription = await db.subscription.findUnique({
    where: { restaurantId },
    select: { status: true, tier: true },
  });

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
  if (tier === "elite") return { allowed: true, tier };

  const currentCount = await db.category.count({ where: { restaurantId } });
  return {
    allowed: currentCount < TIER_LIMITS.standard.maxCategories,
    tier,
  };
}

export async function canAddMenuItem(restaurantId: string, categoryId: string) {
  const tier = await getRestaurantTier(restaurantId);
  if (tier === "elite") return { allowed: true, tier };

  const currentCount = await db.menuItem.count({
    where: { categoryId, category: { restaurantId } },
  });
  return {
    allowed: currentCount < TIER_LIMITS.standard.maxItemsPerCategory,
    tier,
  };
}
