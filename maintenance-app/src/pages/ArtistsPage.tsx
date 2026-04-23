import { useEffect, useState } from "react";
import { fetchArtistNames, fetchArtist, deleteArtist } from "../api/artistsApi";
import AlphabetButtons from "../components/artists/AlphabetButtons";
import ArtistTypeahead from "../components/artists/ArtistTypeahead";
import ArtistRow from "../components/artists/ArtistRow";
import type { Artist } from "../services/artist_types";

export default function ArtistsPage() {
    const [artistNames, setArtistNames] = useState<{ id: number; name: string }[]>([]);
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Namen laden wenn Buchstabe gewechselt wird
    useEffect(() => {
        setLoading(true);
        fetchArtistNames(selectedLetter ?? undefined)
            .then((names) => {
                setArtistNames(names);
                setLoading(false);
            });
    }, [selectedLetter]);

    // Einzelnen Künstler mit allen Daten laden (für Bearbeiten/Anzeigen)
    const handleSelect = async (id: number) => {
        const artist = await fetchArtist(id);
        setSelectedArtist(artist);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Künstler wirklich löschen?")) return;
        const ok = await deleteArtist(id);
        if (ok) {
            setArtistNames((prev) => prev.filter((a) => a.id !== id));
            if (selectedArtist?.id === id) setSelectedArtist(null);
        } else {
            alert("Fehler beim Löschen.");
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Künstlerverwaltung</h2>

            {/* Filter-Bereich */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <AlphabetButtons
                    selected={selectedLetter}
                    onSelect={setSelectedLetter}
                />
                <ArtistTypeahead onSelect={(id) => handleSelect(id)} />
            </div>

            {/* Künstlerliste */}
            {loading ? (
                <div>Lade Künstler...</div>
            ) : (
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 text-left">ID</th>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Herkunft</th>
                            <th className="p-2 text-left">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {artistNames.map((a) => (
                            <tr
                                key={a.id}
                                className="border-b hover:bg-gray-50 cursor-pointer"
                            >
                                <td className="p-2">{a.id}</td>
                                <td
                                    className="p-2 text-blue-600 hover:underline"
                                    onClick={() => handleSelect(a.id)}
                                >
                                    {a.name}
                                </td>
                                <td className="p-2">–</td>
                                <td className="p-2 flex gap-2">
                                    <button
                                        onClick={() => handleSelect(a.id)}
                                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                                    >
                                        Bearbeiten
                                    </button>
                                    <button
                                        onClick={() => handleDelete(a.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                                    >
                                        Löschen
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Detailansicht des gewählten Künstlers */}
            {selectedArtist && (
                <div className="mt-6 p-4 border rounded bg-gray-50">
                    <h3 className="text-xl font-bold">{selectedArtist.name}</h3>
                    <p className="text-gray-600">{selectedArtist.origin}</p>
                    <p className="mt-2">{selectedArtist.vita}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {selectedArtist.artistsImages?.map((img) => (
                            <img
                                key={img.id}
                                src={`http://localhost:8082/${img.thumbnailUrl?.replace("../../", "")}`}
                                alt={img.alt}
                                className="w-24 h-24 object-cover rounded"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}