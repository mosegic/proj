import { getUserRestaurants } from "@/lib/tenant";
import { MenuItemsManager } from "@/components/dashboard/MenuItemsManager";

export default async function MenuPage() {
  const restaurants = await getUserRestaurants();
  return <MenuItemsManager restaurantId={restaurants[0].id} />;
}
