import { useState, useEffect } from "react";
import type { Artist } from "../../services/artist_types";
import { fetchArtist } from "../../api/artistsApi";
import ArtistForm from "./ArtistForm";
import ArtistImageList from "./ArtistImageList";

interface Props {
    artistId: number;
    onClose: () => void;
    onSave: (data: Partial<Artist>) => Promise<void>;
}

export default function ArtistExpandedRow({ artistId, onClose, onSave }: Props) {
    const [artist, setArtist] = useState<Artist | null>(null);
    const [loading, setLoading] = useState(true);

    const loadArtist = async () => {
        setLoading(true);
        const data = await fetchArtist(artistId);
        setArtist(data);
        setLoading(false);
    };

    useEffect(() => {
        loadArtist();
    }, [artistId]);

    if (loading) return (
        <tr>
            <td colSpan={4} className="p-4 text-gray-400">Lade Künstler...</td>
        </tr>
    );

    if (!artist) return null;

    return (
        <tr>
            <td colSpan={4} className="p-0">
                <div className="border-l-4 border-blue-400 bg-gray-50 p-4">
                    {/* Künstler-Formular */}
                    <ArtistForm
                        artist={artist}
                        onSave={onSave}
                        onCancel={onClose}
                    />

                    {/* Bilderliste */}
                    <ArtistImageList
                        artistId={artist.id}
                        images={artist.artistsImages ?? []}
                        onImagesChanged={loadArtist}
                    />
                </div>
            </td>
        </tr>
    );
}