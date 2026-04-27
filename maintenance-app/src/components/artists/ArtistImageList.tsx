import { useState } from "react";
import type { ArtistImage } from "../../services/artist_types";
import { deleteImage } from "../../api/artistsApi";
import ArtistImageForm from "./ArtistImageForm";

interface Props {
    artistId: number;
    images: ArtistImage[];
    onImagesChanged: () => void;  // Callback um Eltern-Komponente zu informieren
}

export default function ArtistImageList({ artistId, images, onImagesChanged }: Props) {
    const [editingImageId, setEditingImageId] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bild wirklich löschen?")) return;
        const ok = await deleteImage(id);
        if (ok) {
            onImagesChanged();
        } else {
            alert("Fehler beim Löschen.");
        }
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">({images.length}) Bilder</h4>
                <button
                    onClick={() => setShowAddForm((v) => !v)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                    {showAddForm ? "Abbrechen" : "+ Bild hinzufügen"}
                </button>
            </div>

            {/* Formular für neues Bild */}
            {showAddForm && (
                <ArtistImageForm
                    artistId={artistId}
                    onSave={() => {
                        setShowAddForm(false);
                        onImagesChanged();
                    }}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {/* Bilderliste */}
            <div className="grid grid-cols-1 gap-3">
                {images.map((img) => (
                    <div key={img.id}>
                        <div className="flex items-center gap-3 border rounded p-2 bg-white">
                            {/* Thumbnail */}
                            <img
                                src={`http://localhost:8082/${img.thumbnailUrl?.replace("../../", "")}`}
                                alt={img.alt}
                                className="w-20 h-20 object-cover rounded flex-shrink-0"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.png";
                                }}
                            />

                            {/* Infos */}
                            <div className="flex-1 text-sm">
                                <p className="font-medium">{img.title ?? "–"}</p>
                                <p className="text-gray-500">{img.alt}</p>
                                <p className="text-gray-400 text-xs">{img.orientation}</p>
                            </div>

                            {/* Aktionen */}
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() =>
                                        setEditingImageId(
                                            editingImageId === img.id ? null : img.id
                                        )
                                    }
                                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                                >
                                    {editingImageId === img.id ? "Schließen" : "Bearbeiten"}
                                </button>
                                <button
                                    onClick={() => handleDelete(img.id)}
                                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                >
                                    Löschen
                                </button>
                            </div>
                        </div>

                        {/* Aufklappbares Bild-Formular */}
                        {editingImageId === img.id && (
                            <ArtistImageForm
                                artistId={artistId}
                                image={img}
                                onSave={() => {
                                    setEditingImageId(null);
                                    onImagesChanged();
                                }}
                                onCancel={() => setEditingImageId(null)}
                            />
                        )}
                    </div>
                ))}

                {images.length === 0 && (
                    <p className="text-gray-400 text-sm">Keine Bilder vorhanden.</p>
                )}
            </div>
        </div>
    );
}