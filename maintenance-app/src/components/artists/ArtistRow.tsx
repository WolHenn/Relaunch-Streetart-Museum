import type { Artist } from "../../services/artist_types";

interface Props {
    artist: Artist;
    onDelete: (id: number) => void;
    onEdit: (id: number) => void;
}

export default function ArtistRow({ artist, onDelete, onEdit }: Props) {
    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="p-2">{artist.id}</td>
            <td className="p-2">{artist.name}</td>
            <td className="p-2">{artist.origin ?? "–"}</td>
            <td className="p-2 flex gap-2">
                <button
                    onClick={() => onEdit(artist.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                >
                    Bearbeiten
                </button>
                <button
                    onClick={() => onDelete(artist.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                >
                    Löschen
                </button>
            </td>
        </tr>
    );
}