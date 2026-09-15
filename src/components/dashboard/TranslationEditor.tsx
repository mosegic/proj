"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type TranslationEditorProps = {
  resourceId: string;
  resourceType: "category" | "menuItem";
  tier: "standard" | "elite";
};

export function TranslationEditor({ resourceId, resourceType, tier }: TranslationEditorProps) {
  const [open, setOpen] = useState(false);
  const [languageCode, setLanguageCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  if (tier !== "elite") return null;

  async function saveTranslation(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [`${resourceType}Id`]: resourceId,
          languageCode: languageCode.trim().toLowerCase(),
          name,
          description,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to save translation");
      setMessage("Translation saved");
      setLanguageCode("");
      setName("");
      setDescription("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save translation");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3">
      <Button size="sm" variant="ghost" onClick={() => setOpen(!open)}>
        {open ? "Close translations" : "Add translation"}
      </Button>
      {open && (
        <form onSubmit={saveTranslation} className="mt-2 rounded-lg border border-blue-100 bg-blue-50 p-3 space-y-2">
          <p className="text-xs font-semibold text-blue-800">Elite multilingual menu</p>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Language code"
              placeholder="fr"
              value={languageCode}
              onChange={(event) => setLanguageCode(event.target.value)}
              required
            />
            <Input
              label="Translated name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <Input
            label="Translated description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Saving..." : "Save translation"}
          </Button>
          {message && <p className="text-xs text-blue-800">{message}</p>}
        </form>
      )}
    </div>
  );
}
