import { useEffect, useState } from "react";
import { fetchArtist } from "../../api/artistsApi";
import type { Artist } from "../../services/artist_types";

interface Props {
    artistId: number;
    onEdit: () => void;
    onBack: () => void;
}

export default function ArtistDetail({ artistId, onEdit, onBack }: Props) {
    const [artist, setArtist] = useState<Artist | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArtist(artistId).then((data) => {
            setArtist(data);
            setLoading(false);
        });
    }, [artistId]);

    if (loading) return <div>Lade Künstler...</div>;
    if (!artist) return <div>Künstler nicht gefunden.</div>;

    return (
        <div className="mt-4">
            {/* Navigation */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={onBack}
                    className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
                >
                    ← Zurück zur Liste
                </button>
                <button
                    onClick={onEdit}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                    Bearbeiten
                </button>
            </div>

            {/* Künstler-Daten */}
            <div className="bg-white border rounded p-4">
                <h3 className="text-2xl font-bold mb-1">{artist.name}</h3>
                {artist.origin && (
                    <p className="text-gray-500 mb-3">{artist.origin}</p>
                )}
                {artist.vita && (
                    <p className="mb-4 whitespace-pre-wrap">{artist.vita}</p>
                )}

                {/* Social Links */}
                <div className="flex gap-3 mb-4 text-sm">
                    {artist.homepageUrl && (
                        <a href={artist.homepageUrl} target="_blank" rel="noreferrer"
                            className="text-blue-500 hover:underline">
                            Homepage
                        </a>
                    )}
                    {artist.facebookUrl && (
                        <a href={artist.facebookUrl} target="_blank" rel="noreferrer"
                            className="text-blue-500 hover:underline">
                            Facebook
                        </a>
                    )}
                    {artist.instaUrl && (
                        <a href={artist.instaUrl} target="_blank" rel="noreferrer"
                            className="text-blue-500 hover:underline">
                            Instagram
                        </a>
                    )}
                </div>

                {/* Bilder */}
                {artist.artistsImages && artist.artistsImages.length > 0 ? (
                    <div>
                        <h4 className="font-semibold mb-2">
                            Bilder ({artist.artistsImages.length})
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {artist.artistsImages.map((img) => (
                                <div key={img.id} className="text-center">
                                    <img
                                        src={`http://localhost:8082/${img.thumbnailUrl?.replace("../../", "")}`}
                                        alt={img.alt}
                                        className="w-28 h-28 object-cover rounded border"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/placeholder.png";
                                        }}
                                    />
                                    {img.title && (
                                        <p className="text-xs text-gray-500 mt-1 w-28 truncate">
                                            {img.title}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">Noch keine Bilder vorhanden.</p>
                )}
            </div>
        </div>
    );
}