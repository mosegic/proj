"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Table {
  id: string;
  label: string;
  tableNumber: number;
}

export function TablesManager({ restaurantId }: { restaurantId: string }) {
  const [tables, setTables] = useState<Table[]>([]);
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", tableNumber: "" });

  async function load() {
    const res = await fetch(`/api/tables?restaurantId=${restaurantId}`);
    const data = await res.json();
    setTables(data.tables || []);
    setSlug(data.slug || "");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [restaurantId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        label: form.label,
        tableNumber: parseInt(form.tableNumber),
      }),
    });
    setForm({ label: "", tableNumber: "" });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this table?")) return;
    await fetch(`/api/tables/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) {
    return <div className="animate-pulse space-y-3">{[1, 2].map((i) => (
      <div key={i} className="h-32 bg-gray-100 rounded-lg" />
    ))}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Tables & QR Codes</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Table"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 rounded-lg p-4 space-y-3">
          <Input
            label="Table Label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Patio Table 1"
            required
          />
          <Input
            label="Table Number"
            type="number"
            min="1"
            value={form.tableNumber}
            onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
            required
          />
          <Button type="submit" size="sm">Create Table</Button>
        </form>
      )}

      {tables.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No tables yet. Add tables to generate QR codes for your customers.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <div
              key={table.id}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center space-y-3"
            >
              <h3 className="font-semibold text-gray-900">{table.label}</h3>
              <p className="text-xs text-gray-500">Table #{table.tableNumber}</p>
              <div className="flex justify-center">
                <img
                  src={`/api/qr/${table.id}?format=png`}
                  alt={`QR code for ${table.label}`}
                  className="w-40 h-40 rounded-lg border"
                />
              </div>
              <p className="text-xs text-gray-400 break-all">
                /menu/{slug}/table/{table.tableNumber}
              </p>
              <div className="flex gap-2 justify-center">
                <a
                  href={`/api/qr/${table.id}?format=png`}
                  download={`qr-table-${table.tableNumber}.png`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Download PNG
                </a>
                <a
                  href={`/api/qr/${table.id}?format=svg`}
                  download={`qr-table-${table.tableNumber}.svg`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Download SVG
                </a>
              </div>
              <Button size="sm" variant="danger" onClick={() => handleDelete(table.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
