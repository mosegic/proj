"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TranslationEditor } from "@/components/dashboard/TranslationEditor";

// dnd-kit core imports
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

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
  const [tier, setTier] = useState<"standard" | "elite">("standard");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/categories?restaurantId=${restaurantId}`);
    const data = await res.json();
    
    // Crucial: Ensure your API return array is sorted by sortOrder asc
    const sortedCategories = (data.categories || []).sort(
      (a: Category, b: Category) => a.sortOrder - b.sortOrder
    );
    setCategories(sortedCategories);
    setTier(data.tier === "elite" ? "elite" : "standard");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [restaurantId]);

  // Handle Drag Finish and Sync to Database
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    const reorderedList = arrayMove(categories, oldIndex, newIndex);
    
    // 1. Optimistic UI update for lag-free dragging
    setCategories(reorderedList);

    // 2. Persist order sequence update array to Prisma API
    try {
      const response = await fetch("/api/categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reorderedList.map((c) => c.id) }),
      });
      if (!response.ok) throw new Error("Sync failed");
    } catch (err) {
      console.error("Failed syncing collection sequence layout:", err);
      load(); // Rollback layout state to match DB if server crashes
    }
  }

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
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }
  const atCategoryLimit = tier === "standard" && categories.length >= 5;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          disabled={atCategoryLimit}
          title={atCategoryLimit ? "Standard plans are limited to 5 categories" : undefined}
        >
          {showForm ? "Cancel" : "+ Add Category"}
        </Button>
      </div>
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
          <Button type="submit" size="sm">Create Category</Button>
        </form>
      )}

      {categories.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No categories yet. Add your first category to get started.
        </p>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={categories} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {categories.map((cat) => (
                <SortableRow
                  key={cat.id}
                  cat={cat}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  handleUpdate={handleUpdate}
                  toggleVisibility={toggleVisibility}
                  handleDelete={handleDelete}
                  tier={tier}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// Extracted Sub-row wrapper context to encapsulate local drag layout logic
interface SortableRowProps {
  cat: Category;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  handleUpdate: (id: string, name: string) => void;
  toggleVisibility: (cat: Category) => void;
  handleDelete: (id: string) => void;
  tier: "standard" | "elite";
}

function SortableRow({
  cat,
  editingId,
  setEditingId,
  handleUpdate,
  toggleVisibility,
  handleDelete,
  tier,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between bg-white border rounded-lg p-4 transition-shadow ${
        isDragging ? "border-indigo-500 shadow-md ring-2 ring-indigo-50 bg-slate-50/80" : "border-gray-200"
      }`}
    >
      {/* Explicit Drag Handle Component mapping attributes/listeners */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 mr-2 text-gray-400 hover:text-gray-600 rounded select-none"
        title="Drag to reorder"
      >
        ☰
      </div>

      <div className="flex-1">
        {editingId === cat.id ? (
          <input
            autoFocus
            defaultValue={cat.name}
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            onBlur={(e) => handleUpdate(cat.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdate(cat.id, e.currentTarget.value);
              if (e.key === "Escape") setEditingId(null);
            }}
          />
        ) : (
          <>
            <h3
              className="font-medium text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors inline-block"
              onClick={() => setEditingId(cat.id)}
              title="Click to inline-edit title name"
            >
              {cat.name}
            </h3>
            <p className="text-xs text-gray-500">
              {cat._count.items} items · {cat.isVisible ? "Visible" : "Hidden"}
            </p>
            <TranslationEditor resourceId={cat.id} resourceType="category" tier={tier} />
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => toggleVisibility(cat)}>
          {cat.isVisible ? "Hide" : "Show"}
        </Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(cat.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}
