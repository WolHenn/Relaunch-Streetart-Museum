import { useEffect, useState, Fragment } from "react";
import {
  fetchArtistNames,
  deleteArtist,
  createArtist,
  updateArtist,
} from "../api/artistsApi";
import AlphabetButtons from "../components/artists/AlphabetButtons";
import ArtistTypeahead from "../components/artists/ArtistTypeahead";
import ArtistExpandedRow from "../components/artists/ArtistExpandedRow";
import ArtistForm from "../components/artists/ArtistForm";
import type { Artist } from "../services/artist_types";

export default function ArtistsPage() {
  const [artistNames, setArtistNames] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNames = async () => {
    setLoading(true);
    const names = await fetchArtistNames(selectedLetter ?? undefined);
    setArtistNames(names);
    setLoading(false);
  };

  useEffect(() => {
    loadNames();
  }, [selectedLetter]);

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Künstler wirklich löschen? Alle Bilder werden ebenfalls gelöscht.",
      )
    )
      return;
    const ok = await deleteArtist(id);
    if (ok) {
      setArtistNames((prev) => prev.filter((a) => a.id !== id));
      if (expandedId === id) setExpandedId(null);
    } else {
      alert("Fehler beim Löschen.");
    }
  };

  const handleEdit = (id: number) => {
    setShowCreateForm(false);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSave = async (data: Partial<Artist>) => {
    if (expandedId) {
      await updateArtist(expandedId, data);
    }
    await loadNames();
    setExpandedId(null);
  };

  const handleCreate = async (data: Partial<Artist>) => {
    const newId = await createArtist(data);
    if (newId > 0) {
      await loadNames();
      setShowCreateForm(false);
      setExpandedId(newId); // ← sofort aufklappen für Bilder
    } else {
      alert("Fehler beim Anlegen des Künstlers.");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Künstlerverwaltung</h2>
        <button
          onClick={() => {
            setShowCreateForm((v) => !v);
            setExpandedId(null);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {showCreateForm ? "Abbrechen" : "+ Neuen Künstler anlegen"}
        </button>
      </div>

      {/* Formular für neuen Künstler */}
      {showCreateForm && (
        <ArtistForm
          onSave={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-4 my-4">
        <AlphabetButtons
          selected={selectedLetter}
          onSelect={setSelectedLetter}
        />
        <ArtistTypeahead onSelect={(id) => handleEdit(id)} />
      </div>

      {/* Tabelle */}
      {loading ? (
        <div>Lade Künstler...</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {artistNames.map((a) => (
              <Fragment key={a.id}>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-2">{a.id}</td>
                  <td className="p-2">{a.name}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(a.id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                    >
                      {expandedId === a.id ? "Schließen" : "Bearbeiten"}
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>

                {expandedId === a.id && (
                  <ArtistExpandedRow
                    artistId={a.id}
                    onClose={() => setExpandedId(null)}
                    onSave={handleSave}
                  />
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
