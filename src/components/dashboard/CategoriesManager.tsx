"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TranslationEditor } from "@/components/dashboard/TranslationEditor";

interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  _count: { items: number };
}

interface CategoryForm {
  name: string;
  description: string;
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

export function CategoriesManager({ restaurantId }: { restaurantId: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tier, setTier] = useState<"standard" | "elite">("standard");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CategoryForm>({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryForm>({ name: "", description: "" });
  const [error, setError] = useState("");

  const fetchCategories = useCallback(
    () => requestJson(`/api/categories?restaurantId=${restaurantId}`),
    [restaurantId],
  );

  async function load() {
    const data = await fetchCategories();
    setCategories(data.categories || []);
    setTier(data.tier === "elite" ? "elite" : "standard");
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data.categories || []);
        setTier(data.tier === "elite" ? "elite" : "standard");
        setLoading(false);
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Could not load categories.");
        setLoading(false);
      });
  }, [fetchCategories]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestJson("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, restaurantId }),
      });
      setForm({ name: "", description: "" });
      setShowForm(false);
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create category.");
    } finally {
      setBusy(false);
    }
  }

  async function updateCategory(id: string, data: Partial<CategoryForm>) {
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setEditingId(null);
      await load();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update category.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisibility(category: Category) {
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !category.isVisible }),
      });
      await load();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Could not update visibility.");
    } finally {
      setBusy(false);
    }
  }

  async function reorderCategory(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= categories.length) return;

    const reordered = [...categories];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    setBusy(true);
    setError("");
    try {
      await requestJson("/api/categories/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          categoryIds: reordered.map(({ id }) => id),
        }),
      });
      await load();
    } catch (reorderError) {
      setError(reorderError instanceof Error ? reorderError.message : "Could not reorder categories.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category and all its items?")) return;
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/categories/${id}`, { method: "DELETE" });
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete category.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-3">{[1, 2, 3].map((i) => (
      <div key={i} className="h-16 bg-gray-100 rounded-lg" />
    ))}</div>;
  }
  const atCategoryLimit = tier === "standard" && categories.length >= 5;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          disabled={atCategoryLimit || busy}
          title={atCategoryLimit ? "Standard plans are limited to 5 categories" : undefined}
        >
          {showForm ? "Cancel" : "+ Add Category"}
        </Button>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {atCategoryLimit && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          You have reached the Standard plan limit of 5 categories. Upgrade to Elite to add more.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 rounded-lg p-4 space-y-3">
          <Input
            label="Category Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Button type="submit" size="sm" loading={busy}>Create Category</Button>
        </form>
      )}

      {categories.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No categories yet. Add your first category to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex-1 min-w-0">
                {editingId === category.id ? (
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void updateCategory(category.id, editForm);
                    }}
                  >
                    <Input
                      label="Category Name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" loading={busy}>Save</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {category._count.items} items · {category.isVisible ? "Visible" : "Hidden"}
                    </p>
                    <TranslationEditor resourceId={category.id} resourceType="category" tier={tier} />
                  </>
                )}
              </div>
              {editingId !== category.id && (
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy || index === 0}
                    aria-label={`Move ${category.name} up`}
                    onClick={() => reorderCategory(index, -1)}
                  >
                    Up
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy || index === categories.length - 1}
                    aria-label={`Move ${category.name} down`}
                    onClick={() => reorderCategory(index, 1)}
                  >
                    Down
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => {
                      setEditingId(category.id);
                      setEditForm({
                        name: category.name,
                        description: category.description ?? "",
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => toggleVisibility(category)}>
                    {category.isVisible ? "Hide" : "Show"}
                  </Button>
                  <Button size="sm" variant="danger" disabled={busy} onClick={() => handleDelete(category.id)}>
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
