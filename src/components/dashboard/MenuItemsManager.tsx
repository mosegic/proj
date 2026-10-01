"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/validations";
import { TranslationEditor } from "@/components/dashboard/TranslationEditor";

interface MenuItemOption {
  id: string;
  name: string;
  priceDelta: string;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isVisible: boolean;
  isSoldOut: boolean;
  sortOrder: number;
  category: { id: string; name: string };
  options: MenuItemOption[];
}

interface Category {
  id: string;
  name: string;
  _count?: { items: number };
}

interface MenuItemForm {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
}

interface OptionForm {
  name: string;
  priceDelta: string;
}

async function requestJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "The request could not be completed.",
    );
  }
  return data;
}

export function MenuItemsManager({ restaurantId }: { restaurantId: string }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tier, setTier] = useState<"standard" | "elite">("standard");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MenuItemForm>({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MenuItemForm>({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
  });
  const [openOptionsId, setOpenOptionsId] = useState<string | null>(null);
  const [optionForm, setOptionForm] = useState<OptionForm>({ name: "", priceDelta: "0" });
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editOptionForm, setEditOptionForm] = useState<OptionForm>({ name: "", priceDelta: "0" });
  const [error, setError] = useState("");

  const fetchMenuData = useCallback(
    () =>
      Promise.all([
        requestJson(`/api/menu-items?restaurantId=${restaurantId}`),
        requestJson(`/api/categories?restaurantId=${restaurantId}`),
      ]),
    [restaurantId],
  );

  async function load() {
    const [itemsData, catsData] = await fetchMenuData();
    setItems(itemsData.items || []);
    setCategories(catsData.categories || []);
    setTier(catsData.tier === "elite" ? "elite" : "standard");
    if (catsData.categories?.length && !form.categoryId) {
      setForm((current) => ({ ...current, categoryId: catsData.categories[0].id }));
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMenuData()
      .then(([itemsData, catsData]) => {
        setItems(itemsData.items || []);
        setCategories(catsData.categories || []);
        setTier(catsData.tier === "elite" ? "elite" : "standard");
        if (catsData.categories?.length) {
          setForm((current) => ({
            ...current,
            categoryId: current.categoryId || catsData.categories[0].id,
          }));
        }
        setLoading(false);
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Could not load menu items.");
        setLoading(false);
      });
  }, [fetchMenuData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestJson("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });
      setForm({
        name: "",
        description: "",
        price: "",
        categoryId: form.categoryId,
        imageUrl: "",
      });
      setShowForm(false);
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create menu item.");
    } finally {
      setBusy(false);
    }
  }

  async function saveItem(id: string) {
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/menu-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, price: parseFloat(editForm.price) }),
      });
      setEditingItemId(null);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update menu item.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleField(item: MenuItem, field: "isSoldOut" | "isVisible" | "isAvailable") {
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/menu-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !item[field] }),
      });
      await load();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Could not update menu item.");
    } finally {
      setBusy(false);
    }
  }

  async function reorderItem(item: MenuItem, direction: -1 | 1) {
    const siblings = items.filter(({ category }) => category.id === item.category.id);
    const currentIndex = siblings.findIndex(({ id }) => id === item.id);
    const destination = currentIndex + direction;
    if (currentIndex < 0 || destination < 0 || destination >= siblings.length) return;
    const reordered = [...siblings];
    [reordered[currentIndex], reordered[destination]] = [
      reordered[destination],
      reordered[currentIndex],
    ];

    setBusy(true);
    setError("");
    try {
      await requestJson("/api/menu-items/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: item.category.id,
          itemIds: reordered.map(({ id }) => id),
        }),
      });
      await load();
    } catch (reorderError) {
      setError(reorderError instanceof Error ? reorderError.message : "Could not reorder menu items.");
    } finally {
      setBusy(false);
    }
  }

  async function createOption(e: React.FormEvent, itemId: string) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/menu-items/${itemId}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: optionForm.name,
          priceDelta: parseFloat(optionForm.priceDelta),
        }),
      });
      setOptionForm({ name: "", priceDelta: "0" });
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create option.");
    } finally {
      setBusy(false);
    }
  }

  async function saveOption(itemId: string, optionId: string) {
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/menu-items/${itemId}/options/${optionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editOptionForm.name,
          priceDelta: parseFloat(editOptionForm.priceDelta),
        }),
      });
      setEditingOptionId(null);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update option.");
    } finally {
      setBusy(false);
    }
  }

  async function reorderOption(item: MenuItem, optionIndex: number, direction: -1 | 1) {
    const destination = optionIndex + direction;
    if (destination < 0 || destination >= item.options.length) return;
    const reordered = [...item.options];
    [reordered[optionIndex], reordered[destination]] = [
      reordered[destination],
      reordered[optionIndex],
    ];

    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/menu-items/${item.id}/options`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIds: reordered.map(({ id }) => id) }),
      });
      await load();
    } catch (reorderError) {
      setError(reorderError instanceof Error ? reorderError.message : "Could not reorder options.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteOption(itemId: string, optionId: string) {
    if (!confirm("Delete this option?")) return;
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/menu-items/${itemId}/options/${optionId}`, { method: "DELETE" });
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete option.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this menu item?")) return;
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/menu-items/${id}`, { method: "DELETE" });
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete menu item.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-3">{[1, 2, 3].map((i) => (
      <div key={i} className="h-20 bg-gray-100 rounded-lg" />
    ))}</div>;
  }

  const selectedCategory = categories.find((category) => category.id === form.categoryId);
  const atItemLimit = tier === "standard" && (selectedCategory?._count?.items ?? 0) >= 15;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Menu Items</h2>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          disabled={categories.length === 0 || atItemLimit || busy}
          title={atItemLimit ? "Standard plans are limited to 15 items per category" : undefined}
        >
          {showForm ? "Cancel" : "+ Add Item"}
        </Button>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {categories.length === 0 && (
        <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
          Create a category first before adding menu items.
        </p>
      )}
      {atItemLimit && (
        <p className="text-amber-800 text-sm bg-amber-50 border border-amber-200 p-3 rounded-lg">
          This category has reached the Standard plan limit of 15 items. Upgrade to Elite or choose another category.
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
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <Button type="submit" size="sm" disabled={atItemLimit} loading={busy}>Add Item</Button>
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
              {item.imageUrl && editingItemId !== item.id && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                {editingItemId === item.id ? (
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void saveItem(item.id);
                    }}
                  >
                    <Input
                      label="Item Name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        required
                      />
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                          value={editForm.categoryId}
                          onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          required
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <Input
                      label="Image URL (optional)"
                      value={editForm.imageUrl}
                      onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" loading={busy}>Save</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setEditingItemId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-xs text-gray-500">{item.category.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                        )}
                        <TranslationEditor resourceId={item.id} resourceType="menuItem" tier={tier} />
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(item.price)}</span>
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
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        aria-expanded={openOptionsId === item.id}
                        onClick={() => {
                          setOpenOptionsId(openOptionsId === item.id ? null : item.id);
                          setEditingOptionId(null);
                        }}
                      >
                        {openOptionsId === item.id ? "Hide options" : `Options (${item.options.length})`}
                      </Button>
                    </div>
                    {openOptionsId === item.id && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3 space-y-3">
                        <h4 className="text-sm font-semibold">Options</h4>
                        {item.options.length === 0 && (
                          <p className="text-sm text-gray-500">No options yet.</p>
                        )}
                        {item.options.map((option, index) => (
                          <div key={option.id} className="flex items-center justify-between gap-3 border-b border-gray-200 pb-2">
                            {editingOptionId === option.id ? (
                              <form
                                className="flex flex-1 flex-wrap items-end gap-2"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  void saveOption(item.id, option.id);
                                }}
                              >
                                <Input
                                  label="Option name"
                                  value={editOptionForm.name}
                                  onChange={(e) => setEditOptionForm({ ...editOptionForm, name: e.target.value })}
                                  required
                                  className="min-w-32"
                                />
                                <Input
                                  label="Price change"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editOptionForm.priceDelta}
                                  onChange={(e) => setEditOptionForm({ ...editOptionForm, priceDelta: e.target.value })}
                                  required
                                  className="w-28"
                                />
                                <Button type="submit" size="sm" loading={busy}>Save</Button>
                                <Button type="button" size="sm" variant="secondary" onClick={() => setEditingOptionId(null)}>
                                  Cancel
                                </Button>
                              </form>
                            ) : (
                              <>
                                <p className="text-sm text-gray-800">
                                  {option.name}
                                  {Number(option.priceDelta) > 0 && (
                                    <span className="ml-2 text-gray-500">
                                      +{formatPrice(option.priceDelta)}
                                    </span>
                                  )}
                                </p>
                                <div className="flex flex-wrap justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={busy || index === 0}
                                    aria-label={`Move ${option.name} up`}
                                    onClick={() => reorderOption(item, index, -1)}
                                  >
                                    Up
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={busy || index === item.options.length - 1}
                                    aria-label={`Move ${option.name} down`}
                                    onClick={() => reorderOption(item, index, 1)}
                                  >
                                    Down
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    disabled={busy}
                                    onClick={() => {
                                      setEditingOptionId(option.id);
                                      setEditOptionForm({
                                        name: option.name,
                                        priceDelta: String(option.priceDelta),
                                      });
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    disabled={busy}
                                    onClick={() => deleteOption(item.id, option.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                        <form
                          className="flex flex-wrap items-end gap-2"
                          onSubmit={(e) => void createOption(e, item.id)}
                        >
                          <Input
                            label="New option"
                            value={optionForm.name}
                            onChange={(e) => setOptionForm({ ...optionForm, name: e.target.value })}
                            required
                            className="min-w-32"
                          />
                          <Input
                            label="Price change"
                            type="number"
                            step="0.01"
                            min="0"
                            value={optionForm.priceDelta}
                            onChange={(e) => setOptionForm({ ...optionForm, priceDelta: e.target.value })}
                            required
                            className="w-28"
                          />
                          <Button type="submit" size="sm" loading={busy}>Add option</Button>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </div>
              {editingItemId !== item.id && (
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {(() => {
                    const siblings = items.filter(({ category }) => category.id === item.category.id);
                    const index = siblings.findIndex(({ id }) => id === item.id);
                    return (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy || index === 0}
                          aria-label={`Move ${item.name} up`}
                          onClick={() => reorderItem(item, -1)}
                        >
                          Up
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy || index === siblings.length - 1}
                          aria-label={`Move ${item.name} down`}
                          onClick={() => reorderItem(item, 1)}
                        >
                          Down
                        </Button>
                      </>
                    );
                  })()}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => {
                      setEditingItemId(item.id);
                      setEditForm({
                        name: item.name,
                        description: item.description ?? "",
                        price: String(item.price),
                        categoryId: item.category.id,
                        imageUrl: item.imageUrl ?? "",
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => toggleField(item, "isSoldOut")}>
                    {item.isSoldOut ? "Restock" : "Sold Out"}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => toggleField(item, "isVisible")}>
                    {item.isVisible ? "Hide" : "Show"}
                  </Button>
                  <Button size="sm" variant="danger" disabled={busy} onClick={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
