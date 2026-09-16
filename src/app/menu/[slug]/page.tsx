import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/tenant";
import { PublicMenu } from "@/components/menu/PublicMenu";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const restaurant = await getRestaurantBySlug(slug, lang);
  if (!restaurant) return { title: "Menu Not Found" };
  return {
    title: `${restaurant.name} — Menu`,
    description: restaurant.description || `View the menu for ${restaurant.name}`,
  };
}

export default async function PublicMenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const restaurant = await getRestaurantBySlug(slug, lang);
  if (!restaurant) notFound();

  return (
    <PublicMenu
      restaurant={restaurant}
      menuPath={`/menu/${slug}`}
      languageCode={lang}
    />
  );
}
