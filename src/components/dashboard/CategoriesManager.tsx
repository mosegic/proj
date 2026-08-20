"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  _count: { items: number };
}

export function CategoriesManager({ restaurantId }: { restaurantId: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/categories?restaurantId=${restaurantId}`);
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [restaurantId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, restaurantId }),
    });
    setForm({ name: "", description: "" });
    setShowForm(false);
    load();
  }

  async function toggleVisibility(cat: Category) {
    await fetch(`/api/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !cat.isVisible }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category and all its items?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  }

  async function handleUpdate(id: string, name: string) {
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setEditingId(null);
    load();
  }

  if (loading) {
    return <div className="animate-pulse space-y-3">{[1, 2, 3].map((i) => (
      <div key={i} className="h-16 bg-gray-100 rounded-lg" />
    ))}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Category"}
        </Button>
      </div>

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
          <Button type="submit" size="sm">Create Category</Button>
        </form>
      )}

      {categories.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No categories yet. Add your first category to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex-1">
                {editingId === cat.id ? (
                  <input
                    autoFocus
                    defaultValue={cat.name}
                    className="border rounded px-2 py-1 text-sm"
                    onBlur={(e) => handleUpdate(cat.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(cat.id, e.currentTarget.value);
                    }}
                  />
                ) : (
                  <>
                    <h3
                      className="font-medium text-gray-900 cursor-pointer"
                      onClick={() => setEditingId(cat.id)}
                    >
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {cat._count.items} items · {cat.isVisible ? "Visible" : "Hidden"}
                    </p>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleVisibility(cat)}
                >
                  {cat.isVisible ? "Hide" : "Show"}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(cat.id)}
                >
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
