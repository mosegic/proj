import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/tenant";
import { PublicMenu } from "@/components/menu/PublicMenu";

type PageProps = {
  params: Promise<{ slug: string; tableNumber: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug, tableNumber } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return { title: "Menu Not Found" };
  return {
    title: `${restaurant.name} — Table ${tableNumber}`,
  };
}

export default async function TableMenuPage({ params }: PageProps) {
  const { slug, tableNumber } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return (
    <PublicMenu
      restaurant={restaurant}
      tableNumber={parseInt(tableNumber)}
    />
  );
}
