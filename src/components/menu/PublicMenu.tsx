import { CurrencyProvider } from "./CurrencyContext";
import { CurrencySelector } from "./CurrencySelector";
import { PriceDisplay } from "./PriceDisplay";
import { ImageWithPlaceholder } from "./ImageWithPlaceholder";

type MonetaryValue = string | number | { toString(): string };

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: MonetaryValue;
  imageUrl: string | null;
  isSoldOut: boolean;
  isAvailable: boolean;
  options: { id: string; name: string; priceDelta: MonetaryValue }[];
  translations?: { name: string; description: string | null }[];
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  items: MenuItem[];
  translations?: { name: string; description: string | null }[];
}

interface Restaurant {
  name: string;
  description: string | null;
  logoUrl: string | null;
  whatsappNumber: string | null;
  themeColor: string;
  accentColor: string;
  categories: Category[];
  availableLanguages?: string[];
}

interface PublicMenuProps {
  restaurant: Restaurant;
  tableNumber?: number;
  menuPath: string;
  languageCode?: string;
}

export function PublicMenu({
  restaurant,
  tableNumber,
  menuPath,
  languageCode,
}: PublicMenuProps) {
  const theme = restaurant.themeColor;
  const languages = restaurant.availableLanguages || [];
  const whatsappDigits = restaurant.whatsappNumber?.replace(/\D/g, "");

  return (
    <CurrencyProvider>
    <div className="min-h-screen bg-gray-100">
      <header
        className="sticky top-0 z-10 shadow-sm"
        style={{ backgroundColor: theme }}
      >
        <div className="max-w-lg mx-auto px-4 py-6 text-white">
          <div className="flex items-center gap-3">
            {restaurant.logoUrl ? (
              <ImageWithPlaceholder
                src={restaurant.logoUrl}
                alt={restaurant.name}
                containerClassName="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white/70 shadow-lg ring-2 ring-white/20"
                imageClassName="w-16 h-16 object-cover"
                fallback={
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold border-4 border-white/40 shadow-lg">
                    {restaurant.name.charAt(0)}
                  </div>
                }
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold border-4 border-white/40 shadow-lg">
                {restaurant.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{restaurant.name}</h1>
              {tableNumber && (
                <p className="text-sm opacity-80">Table {tableNumber}</p>
              )}
            </div>
          </div>
          {restaurant.description && (
            <p className="mt-2 text-sm opacity-90">{restaurant.description}</p>
          )}
          {languages.length > 0 && (
            <nav className="mt-4 flex items-center gap-2" aria-label="Menu language">
              <span className="text-xs opacity-80">Language:</span>
              <a
                href={menuPath}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  !languageCode ? "bg-white text-gray-900" : "bg-white/20 hover:bg-white/30"
                }`}
              >
                Original
              </a>
              {languages.map((language) => (
                <a
                  key={language}
                  href={`${menuPath}?lang=${encodeURIComponent(language)}`}
                  className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${
                    languageCode === language
                      ? "bg-white text-gray-900"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {language}
                </a>
              ))}
            </nav>
          )}
          <CurrencySelector />
          {whatsappDigits && whatsappDigits.length >= 8 && (
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#20bd5a]"
            >
           
              WhatsApp
            </a>
          )}
        </div>
      </header>

<main className="max-w-lg mx-auto px-4 py-7 pb-20 space-y-6">
  {restaurant.categories.length === 0 ? (
    <p className="text-center text-gray-500 py-12">Menu coming soon...</p>
  ) : (
    restaurant.categories.map((category) => {
      const categoryTranslation = category.translations?.[0];
      return (
      <section key={category.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <span
              className="h-8 w-1 rounded-full"
              style={{ backgroundColor: theme }}
              aria-hidden="true"
            />
            <h2
              className="text-xl font-bold tracking-tight"
              style={{ color: theme }}
            >
              {categoryTranslation?.name || category.name}
            </h2>
          </div>
          {(categoryTranslation?.description || category.description) && (
            <p className="mt-2 pl-4 text-sm leading-6 text-gray-500">
              {categoryTranslation?.description || category.description}
            </p>
          )}
        </div>
        <div className="space-y-3 bg-gray-50/70 p-3 sm:p-4">
          {category.items.map((item) => {
            const itemTranslation = item.translations?.[0];
            return (
            <article
              key={item.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                item.isSoldOut ? "opacity-50" : ""
              } border border-gray-100`}
            >
              <div className="p-4 flex flex-col gap-3">
                {/* Top Section: Title & Price */}
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {itemTranslation?.name || item.name}
                  </h3>
                  <span
                    className="font-bold text-base whitespace-nowrap"
                    style={{ color: theme }}
                  >
                    <PriceDisplay price={item.price} />
                  </span>
                </div>

                {/* Middle Section: Description */}
                {(itemTranslation?.description || item.description) && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {itemTranslation?.description || item.description}
                  </p>
                )}

         {/* Original Uncropped Image Box with Stable Height Constraint */}
{item.imageUrl && (
  <ImageWithPlaceholder
    src={item.imageUrl}
    alt={item.name}
    containerClassName="w-full h-48 sm:h-56 mt-2 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center"
    imageClassName="w-full h-full object-contain transition-transform duration-300 hover:scale-[1.02]"
  />
)}


                {/* Bottom Section: Badges & Options */}
                <div className="space-y-2 mt-1">
                  {item.isSoldOut && (
                    <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      Sold Out
                    </span>
                  )}
                  {!item.isAvailable && !item.isSoldOut && (
                    <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      Unavailable
                    </span>
                  )}
                  {item.options && item.options.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.options.map((opt) => (
                        <span
                          key={opt.id}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                        >
                          {opt.name}
                          {opt.priceDelta && parseFloat(String(opt.priceDelta)) > 0 && (
                            <span> +<PriceDisplay price={opt.priceDelta} /></span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </section>
      );
    })
  )}
</main>
<footer className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 py-3">
  <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-center gap-3">
    <p className="text-xs text-gray-400">
      onlinemenusaas@gmail.com MenuSaaS
    </p>
    {/* Your Facebook Link */}
    <a
      href="https://www.facebook.com/profile.php?id=61594332673347"
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-500 hover:text-blue-600 transition-colors"
      aria-label="Facebook Page"
    >
      <Facebook className="w-5 h-5" />
    </a>
  </div>
</footer>

    </div>
    </CurrencyProvider>
  );
}
