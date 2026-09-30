import { CurrencyProvider } from "./CurrencyContext";
import { CurrencySelector } from "./CurrencySelector";
import { PriceDisplay } from "./PriceDisplay";
import { ImageWithPlaceholder } from "./ImageWithPlaceholder";

type MonetaryValue = string | number | { toString(): string };

interface TranslationItem {
  languageCode: string;
  name: string;
  description: string | null;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: MonetaryValue;
  imageUrl: string | null;
  isSoldOut: boolean;
  isAvailable: boolean;
  options: { id: string; name: string; priceDelta: MonetaryValue }[];
  translations?: TranslationItem[];
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  items: MenuItem[];
  translations?: TranslationItem[];
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

  const getNumericDelta = (delta: MonetaryValue): number => {
    if (typeof delta === "object" && delta !== null && "toString" in delta) {
      return parseFloat(delta.toString()) || 0;
    }
    return parseFloat(String(delta)) || 0;
  };

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col antialiased text-gray-900">
        <header
          className="sticky top-0 z-50 shadow-md transition-colors duration-200"
          style={{ backgroundColor: theme }}
        >
          <div className="max-w-xl mx-auto px-4 py-5 text-white flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {restaurant.logoUrl ? (
                <ImageWithPlaceholder
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  containerClassName="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/80 shadow-md shrink-0"
                  imageClassName="w-full h-full object-cover"
                  fallback={
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/40 shadow-md shrink-0">
                      {restaurant.name.charAt(0)}
                    </div>
                  }
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/40 shadow-md shrink-0">
                  {restaurant.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold tracking-tight truncate">{restaurant.name}</h1>
                {tableNumber && (
                  <p className="text-xs font-medium bg-white/20 inline-block px-2 py-0.5 rounded-md mt-0.5 backdrop-blur-sm">
                    Table {tableNumber}
                  </p>
                )}
              </div>
            </div>

            {restaurant.description && (
              <p className="text-sm opacity-90 leading-relaxed line-clamp-2">{restaurant.description}</p>
            )}

            {languages.length > 0 && (
              <nav className="flex flex-wrap items-center gap-1.5 pt-1 text-xs" aria-label="Menu language">
                <span className="opacity-75 mr-1">Language:</span>
                <a
                  href={menuPath}
                  className={`rounded-full px-3 py-1 font-medium transition-all ${
                    !languageCode ? "bg-white text-gray-900 shadow-sm" : "bg-white/15 hover:bg-white/25 text-white"
                  }`}
                >
                  Original
                </a>
                {languages.map((lang) => (
                  <a
                    key={lang}
                    href={`${menuPath}?lang=${encodeURIComponent(lang)}`}
                    className={`rounded-full px-3 py-1 font-medium uppercase transition-all ${
                      languageCode === lang
                        ? "bg-white text-gray-900 shadow-sm"
                        : "bg-white/15 hover:bg-white/25 text-white"
                    }`}
                  >
                    {lang}
                  </a>
                ))}
              </nav>
            )}

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10 mt-1">
              <CurrencySelector />
              {whatsappDigits && whatsappDigits.length >= 8 && (
                <a
                  href={`https://wa.me{whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-[#20bd5a] transition-all hover:scale-[1.02]"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Main Menu view - Widened to max-w-2xl to give breathing room for side-by-side cards */}
        <main className="max-w-2xl w-full mx-auto px-4 py-6 pb-24 space-y-6 flex-1">
          {restaurant.categories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm px-4">
              <p className="text-gray-500 font-medium">Menu coming soon...</p>
            </div>
          ) : (
            restaurant.categories.map((category) => {
              const categoryTranslation = category.translations?.find((t) => t.languageCode === languageCode);
              const categoryName = categoryTranslation?.name || category.name;
              const categoryDesc = categoryTranslation?.description || category.description;

              return (
                <section key={category.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-6 w-1 rounded-full shrink-0"
                        style={{ backgroundColor: theme }}
                        aria-hidden="true"
                      />
                      <h2 className="text-lg font-bold tracking-tight" style={{ color: theme }}>
                        {categoryName}
                      </h2>
                    </div>
                    {categoryDesc && (
                      <p className="mt-1 pl-4 text-xs leading-relaxed text-gray-500">
                        {categoryDesc}
                      </p>
                    )}
                  </div>

                  {/* CHANGED HERE: Added grid grid-cols-1 xs:grid-cols-2 gap-3 or gap-4 for side-by-side presentation */}
                  /* ... Keep the top rest of the component identical up to the category mapping loop ... */

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/60 p-3 sm:p-4">
  {category.items.map((item) => {
    const itemTranslation = item.translations?.find((t) => t.languageCode === languageCode);
    const itemName = itemTranslation?.name || item.name;
    const itemDesc = itemTranslation?.description || item.description;

    return (
      <article
        key={item.id}
        className={`bg-white rounded-xl shadow-xs overflow-hidden border border-gray-100 transition-opacity flex flex-col justify-between ${
          item.isSoldOut ? "opacity-60" : ""
        }`}
      >
        <div className="flex flex-col">
          {/* Top Box: Image */}
          {item.imageUrl && (
            <ImageWithPlaceholder
              src={item.imageUrl}
              alt={itemName}
              containerClassName="w-full aspect-video overflow-hidden bg-gray-50 flex items-center justify-center border-b border-gray-100"
              imageClassName="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]"
            />
          )}

          {/* Text Body */}
          <div className="p-3 flex flex-col gap-1.5">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                {itemName}
              </h3>
              <span className="font-bold text-sm whitespace-nowrap" style={{ color: theme }}>
                <PriceDisplay price={item.price} />
              </span>
            </div>

            {itemDesc && (
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {itemDesc}
              </p>
            )}
          </div>
        </div>

        {/* Options/Badges Footnote Section (FIXED HERE) */}
        <div className="p-3 pt-0 flex flex-wrap items-center gap-1">
          {item.isSoldOut && (
            <span className="inline-flex text-[9px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-red-200/50">
              Sold Out
            </span>
          )}
          {!item.isAvailable && !item.isSoldOut && (
            <span className="inline-flex text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-amber-200/50">
              Unavailable
            </span>
          )}
          {item.options && item.options.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.options.map((opt) => (
                <span
                  key={opt.id}
                  className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200/40"
                >
                  {opt.name}
                  {opt.priceDelta && getNumericDelta(opt.priceDelta) > 0 && (
                    <> +<PriceDisplay price={opt.priceDelta} /></>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  })}
</div>

/* ... Keep the footer and component closing structural tags identical ... */


                          {/* Options/Badges Footnote Section */}
                          <div className="p-3 pt-0 flex flex-wrap items-center gap-1">
{item.isSoldOut && (

Sold Out

)}
{!item.isAvailable && !item.isSoldOut && (

Unavailable

)}
{item.options && item.options.length > 0 && (

{item.options.map((opt) => (

{opt.name}
{opt.priceDelta && getNumericDelta(opt.priceDelta) > 0 && (

{" "}+

)}

))}

)}


);
})}


);
})
)}
onlinemenusaas@gmail.com










);
}
