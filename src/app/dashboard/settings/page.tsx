"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  themeColor: string;
  accentColor: string;
}

export default function SettingsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.restaurants?.[0]) {
          setRestaurant(data.user.restaurants[0]);
        }
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurant) return;
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/restaurants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restaurant),
    });

    if (res.ok) {
      setMessage("Settings saved!");
    } else {
      setMessage("Failed to save settings.");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;
  }

  if (!restaurant) return <p>Restaurant not found.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <Input
          label="Business Name"
          value={restaurant.name}
          onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
        />
        <Input
          label="Description"
          value={restaurant.description || ""}
          onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
        />
        <Input
          label="Logo URL"
          value={restaurant.logoUrl || ""}
          onChange={(e) => setRestaurant({ ...restaurant, logoUrl: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Theme Color"
            type="color"
            value={restaurant.themeColor}
            onChange={(e) => setRestaurant({ ...restaurant, themeColor: e.target.value })}
          />
          <Input
            label="Accent Color"
            type="color"
            value={restaurant.accentColor}
            onChange={(e) => setRestaurant({ ...restaurant, accentColor: e.target.value })}
          />
        </div>
        <p className="text-sm text-gray-500">
          Menu URL: <code className="bg-gray-100 px-1 rounded">/menu/{restaurant.slug}</code>
        </p>
        <Button type="submit" loading={saving}>Save Settings</Button>
      </form>
    </div>
  );
}
