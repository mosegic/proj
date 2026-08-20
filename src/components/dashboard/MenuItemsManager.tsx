"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/validations";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isVisible: boolean;
  isSoldOut: boolean;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

export function MenuItemsManager({ restaurantId }: { restaurantId: string }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
  });

  async function load() {
    const [itemsRes, catsRes] = await Promise.all([
      fetch(`/api/menu-items?restaurantId=${restaurantId}`),
      fetch(`/api/categories?restaurantId=${restaurantId}`),
    ]);
    const itemsData = await itemsRes.json();
    const catsData = await catsRes.json();
    setItems(itemsData.items || []);
    setCategories(catsData.categories || []);
    if (catsData.categories?.length && !form.categoryId) {
      setForm((f) => ({ ...f, categoryId: catsData.categories[0].id }));
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [restaurantId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
      }),
    });
    setForm({ name: "", description: "", price: "", categoryId: form.categoryId, imageUrl: "" });
    setShowForm(false);
    load();
  }

  async function toggleField(item: MenuItem, field: "isSoldOut" | "isVisible" | "isAvailable") {
    await fetch(`/api/menu-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !item[field] }),
    });
    load();
  }

  async function updatePrice(id: string, price: string) {
    await fetch(`/api/menu-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: parseFloat(price) }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this menu item?")) return;
    await fetch(`/api/menu-items/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) {
    return <div className="animate-pulse space-y-3">{[1, 2, 3].map((i) => (
      <div key={i} className="h-20 bg-gray-100 rounded-lg" />
    ))}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Menu Items</h2>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          disabled={categories.length === 0}
        >
          {showForm ? "Cancel" : "+ Add Item"}
        </Button>
      </div>

      {categories.length === 0 && (
        <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
          Create a category first before adding menu items.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 rounded-lg p-4 space-y-3">
          <Input
            label="Item Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <Button type="submit" size="sm">Add Item</Button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No menu items yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex gap-4 bg-white border rounded-lg p-4 ${
                item.isSoldOut ? "opacity-60 border-red-200" : "border-gray-200"
              }`}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.category.name}</p>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={item.price}
                    className="w-20 text-right border rounded px-2 py-1 text-sm font-semibold"
                    onBlur={(e) => updatePrice(item.id, e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.isSoldOut && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Sold Out
                    </span>
                  )}
                  {!item.isVisible && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Button size="sm" variant="ghost" onClick={() => toggleField(item, "isSoldOut")}>
                  {item.isSoldOut ? "Restock" : "Sold Out"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleField(item, "isVisible")}>
                  {item.isVisible ? "Hide" : "Show"}
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
