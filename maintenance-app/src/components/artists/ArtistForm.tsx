import { useState } from "react";
import type { Artist } from "../../services/artist_types";

interface Props {
  artist?: Artist;
  onSave: (data: Partial<Artist>) => Promise<void>;
  onCancel: () => void;
  isCreateMode?: boolean; // ← optionaler Hinweis für UI-Text
}

export default function ArtistForm({ artist, onSave, onCancel }: Props) {
  const isEditMode = !!artist;

  const [formData, setFormData] = useState({
    name: artist?.name ?? "",
    origin: artist?.origin ?? "",
    vita: artist?.vita ?? "",
    homepageUrl: artist?.homepageUrl ?? "",
    facebookUrl: artist?.facebookUrl ?? "",
    instaUrl: artist?.instaUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Name ist erforderlich.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(formData);
    } catch {
      setError("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 border rounded p-4 mt-2">
      <h3 className="text-lg font-bold mb-3">
        {isEditMode
          ? `Künstler bearbeiten: ${artist.name}`
          : "Neuen Künstler anlegen"}
      </h3>

      {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Herkunft</label>
          <input
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Homepage</label>
          <input
            name="homepageUrl"
            value={formData.homepageUrl}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Facebook</label>
          <input
            name="facebookUrl"
            value={formData.facebookUrl}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instagram</label>
          <input
            name="instaUrl"
            value={formData.instaUrl}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Vita</label>
          <textarea
            name="vita"
            value={formData.vita}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving
            ? "Speichert..."
            : isEditMode
              ? "Änderungen speichern"
              : "Künstler anlegen & Bilder hinzufügen →"}
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
