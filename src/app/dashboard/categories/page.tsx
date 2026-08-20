import { getUserRestaurants } from "@/lib/tenant";
import { CategoriesManager } from "@/components/dashboard/CategoriesManager";

export default async function CategoriesPage() {
  const restaurants = await getUserRestaurants();
  return <CategoriesManager restaurantId={restaurants[0].id} />;
}
