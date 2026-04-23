import { useEffect, useState } from "react";
import { fetchArtistNames } from "../../api/artistsApi";

interface Props {
    onSelect: (id: number, name: string) => void;
}

export default function ArtistTypeahead({ onSelect }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ id: number; name: string }[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            const names = await fetchArtistNames(undefined, query);
            setResults(names);
            setOpen(true);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="relative w-64">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Künstler suchen..."
                className="w-full border rounded px-3 py-1"
            />
            {open && results.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-60 overflow-y-auto">
                    {results.map((artist) => (
                        <li
                            key={artist.id}
                            onClick={() => {
                                onSelect(artist.id, artist.name);
                                setQuery(artist.name);
                                setOpen(false);
                            }}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                        >
                            {artist.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}