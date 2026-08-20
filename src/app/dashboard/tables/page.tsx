import { getUserRestaurants } from "@/lib/tenant";
import { TablesManager } from "@/components/dashboard/TablesManager";

export default async function TablesPage() {
  const restaurants = await getUserRestaurants();
  return <TablesManager restaurantId={restaurants[0].id} />;
}
