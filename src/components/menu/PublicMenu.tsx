import React from 'react';

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
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  items: MenuItem[];
}

interface Restaurant {
  name: string;
  description: string | null;
  logoUrl: string | null;
  themeColor: string;
  accentColor: string;
  categories: Category[];
}

interface PublicMenuProps {
  restaurant: Restaurant;
  tableNumber?: number;
}

function formatPrice(price: MonetaryValue): string {
  const num = typeof price === "string" || typeof price === "number"
    ? Number(price)
    : Number(price.toString());
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function PublicMenu({ restaurant, tableNumber }: PublicMenuProps) {
  const theme = restaurant.themeColor;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-10 shadow-sm"
        style={{ backgroundColor: theme }}
      >
        <div className="max-w-lg mx-auto px-4 py-5 text-white">
          <div className="flex items-center gap-3">
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                {restaurant.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{restaurant.name}</h1>
              {tableNumber && (
                <p className="text-sm opacity-80">Table {tableNumber}</p>
              )}
            </div>
          </div>
          {restaurant.description && (
            <p className="mt-2 text-sm opacity-90">{restaurant.description}</p>
          )}
        </div>
      </header>

      {/* Main Menu Feed Container */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-20 space-y-8">
        {restaurant.categories.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Menu coming soon...</p>
        ) : (
          restaurant.categories.map((category) => (
            <section key={category.id}>
              {/* Sticky Category Header */}
              <h2
                className="text-lg font-bold mb-1 sticky top-[88px] bg-gray-50 py-2 z-10"
                style={{ color: theme }}
              >
                {category.name}
              </h2>
              
              {category.description && (
                <p className="text-sm text-gray-500 mb-3">{category.description}</p>
              )}

              {/* Menu Items Stack */}
              <div className="space-y-3">
                {category.items.map((item) => (
                  <article
                    key={item.id}
                    className={`bg-white rounded-xl shadow-sm overflow-hidden transition-opacity ${
                      item.isSoldOut ? "opacity-50" : ""
                    }`}
                  >
                    <div className="p-4 flex flex-col gap-3">
                      {/* Top Section: Title & Price */}
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-semibold text-gray-900 text-base">{item.name}</h3>
                        <span
                          className="font-bold text-base whitespace-nowrap"
                          style={{ color: theme }}
                        >
                          {formatPrice(item.price)}
                        </span>
                      </div>

                      {/* Middle Section: Description */}
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {item.description}
                        </p>
                      )}

                      {/* Original Uncropped Image Box with Stable Height Constraint */}
                      {item.imageUrl && (
                        <div className="w-full h-48 sm:h-56 mt-2 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </div>
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
                                {opt.priceDelta && parseFloat(String(opt.priceDelta)) > 0 &&
                                  ` +${formatPrice(opt.priceDelta)}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Powered By Footer */}
      <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 py-3 text-center z-10">
        <p className="text-xs text-gray-400">
          Powered by MenuSaaS onlinemenusaas@gmail.com
        </p>
      </footer>
    </div>
  );
}
