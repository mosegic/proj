import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/tenant";
import { PublicMenu } from "@/components/menu/PublicMenu";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return { title: "Menu Not Found" };
  return {
    title: `${restaurant.name} — Menu`,
    description: restaurant.description || `View the menu for ${restaurant.name}`,
  };
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return <PublicMenu restaurant={restaurant} />;
}
