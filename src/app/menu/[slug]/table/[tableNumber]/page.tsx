import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/tenant";
import { PublicMenu } from "@/components/menu/PublicMenu";

type PageProps = {
  params: Promise<{ slug: string; tableNumber: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { slug, tableNumber } = await params;
  const { lang } = await searchParams;
  const restaurant = await getRestaurantBySlug(slug, lang);
  if (!restaurant) return { title: "Menu Not Found" };
  return {
    title: `${restaurant.name} — Table ${tableNumber}`,
  };
}

export default async function TableMenuPage({ params, searchParams }: PageProps) {
  const { slug, tableNumber } = await params;
  const { lang } = await searchParams;
  const restaurant = await getRestaurantBySlug(slug, lang);
  if (!restaurant) notFound();

  return (
    <PublicMenu
      restaurant={restaurant}
      tableNumber={parseInt(tableNumber)}
      menuPath={`/menu/${slug}/table/${tableNumber}`}
      languageCode={lang}
    />
  );
}
