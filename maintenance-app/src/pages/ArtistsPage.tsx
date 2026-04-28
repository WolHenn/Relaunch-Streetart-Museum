import { useEffect, useState } from "react";
import { Fragment } from "react";
import {
    fetchArtistNames,
    deleteArtist,
    createArtist,
    updateArtist
} from "../api/artistsApi";
import AlphabetButtons from "../components/artists/AlphabetButtons";
import ArtistTypeahead from "../components/artists/ArtistTypeahead";
import ArtistExpandedRow from "../components/artists/ArtistExpandedRow";
import ArtistForm from "../components/artists/ArtistForm";
import ArtistDetail from "../components/artists/ArtistDetail";
import type { Artist } from "../services/artist_types";

type PageMode =
    | { type: 'idle' }
    | { type: 'list'; letter: string | null }
    | { type: 'edit'; artistId: number; fromLetter: string | null | undefined }
    | { type: 'detail'; artistId: number; fromLetter: string | null | undefined }
    | { type: 'create' };

export default function ArtistsPage() {
    const [mode, setMode] = useState<PageMode>({ type: 'idle' });
    const [artistNames, setArtistNames] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode.type !== 'list') return;
        setLoading(true);
        fetchArtistNames(mode.letter ?? undefined).then((names) => {
            setArtistNames(names);
            setLoading(false);
        });
    }, [mode]);

    const handleLetterSelect = (letter: string | null) => {
        setMode({ type: 'list', letter });
    };

    const handleTypeaheadSelect = (id: number) => {
        // Vom Typeahead: kein fromLetter, Zurück geht zu idle
        setMode({ type: 'edit', artistId: id, fromLetter: undefined });
    };

    const handleEditFromList = (id: number) => {
        const letter = mode.type === 'list' ? mode.letter : null;
        setMode({ type: 'edit', artistId: id, fromLetter: letter });
    };

    const handleBack = () => {
        if (mode.type === 'edit' || mode.type === 'detail') {
            if (mode.fromLetter !== undefined) {
                // Zurück zur Liste mit dem gespeicherten Buchstaben
                setMode({ type: 'list', letter: mode.fromLetter });
            } else {
                // Vom Typeahead gekommen → zurück zu idle
                setMode({ type: 'idle' });
            }
        } else {
            setMode({ type: 'idle' });
        }
    };

    const handleSave = async (data: Partial<Artist>) => {
        if (mode.type !== 'edit') return;
        await updateArtist(mode.artistId, data);
        // Nach Speichern: Detailansicht zeigen
        setMode({
            type: 'detail',
            artistId: mode.artistId,
            fromLetter: mode.fromLetter
        });
    };

    const handleCreate = async (data: Partial<Artist>) => {
        const newId = await createArtist(data);
        if (newId > 0) {
            // Nach Anlegen: direkt in Edit-Modus für Bilder
            setMode({ type: 'edit', artistId: newId, fromLetter: undefined });
        } else {
            alert("Fehler beim Anlegen des Künstlers.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Künstler wirklich löschen? Alle Bilder werden ebenfalls gelöscht.")) return;
        const ok = await deleteArtist(id);
        if (ok) {
            setArtistNames((prev) => prev.filter((a) => a.id !== id));
            setMode({ type: 'idle' });
        } else {
            alert("Fehler beim Löschen.");
        }
    };

    const showSearch = mode.type !== 'create';

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Künstlerverwaltung</h2>
                {mode.type !== 'create' && (
                    <button
                        onClick={() => setMode({ type: 'create' })}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        + Neuen Künstler anlegen
                    </button>
                )}
            </div>

            {/* Suchbereich */}
            {showSearch && (
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <AlphabetButtons
                        selected={mode.type === 'list' ? mode.letter : null}
                        onSelect={handleLetterSelect}
                    />
                    <ArtistTypeahead onSelect={handleTypeaheadSelect} />
                </div>
            )}

            {/* Neuen Künstler anlegen */}
            {mode.type === 'create' && (
                <ArtistForm
                    onSave={handleCreate}
                    onCancel={() => setMode({ type: 'idle' })}
                />
            )}

            {/* Künstler-Liste */}
            {mode.type === 'list' && (
                <div className="mt-2">
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
                                            <td
                                                className="p-2 text-blue-600 hover:underline cursor-pointer"
                                                onClick={() => handleEditFromList(a.id)}
                                            >
                                                {a.name}
                                            </td>
                                            <td className="p-2 flex gap-2">
                                                <button
                                                    onClick={() => handleEditFromList(a.id)}
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
                                    </Fragment>
                                ))}
                                {artistNames.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-4 text-gray-400">
                                            Keine Künstler gefunden.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Künstler bearbeiten */}
            {mode.type === 'edit' && (
                <div className="mt-4">
                    <button
                        onClick={handleBack}
                        className="text-sm text-gray-500 hover:text-gray-800 mb-3 flex items-center gap-1"
                    >
                        ← Zurück
                    </button>
                    <table className="w-full">
                        <tbody>
                            <ArtistExpandedRow
                                artistId={mode.artistId}
                                onClose={handleBack}
                                onSave={handleSave}
                            />
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detailansicht nach Speichern */}
            {mode.type === 'detail' && (
                <ArtistDetail
                    artistId={mode.artistId}
                    onEdit={() => setMode({
                        type: 'edit',
                        artistId: mode.artistId,
                        fromLetter: mode.fromLetter
                    })}
                    onBack={handleBack}
                />
            )}
        </div>
    );
}