import { useEffect, useState } from "react";
import { fetchArtistNames } from "../../api/artistsApi";

interface Props {
  onSelect: (id: number) => void;
  resetSignal?: number; // ← NEU: von außen auslösbarer Reset
}

export default function ArtistTypeahead({ onSelect, resetSignal }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: number; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Reset wenn resetSignal sich ändert (z.B. nach Buchstabenauswahl)
  useEffect(() => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setNoResults(false);
  }, [resetSignal]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      setNoResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      const names = await fetchArtistNames(undefined, query);
      if (names.length > 0) {
        setResults(names);
        setOpen(true);
        setNoResults(false);
      } else {
        setResults([]);
        setOpen(false);
        setNoResults(true); // ← Punkt 4
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (id: number, name: string) => {
    onSelect(id);
    setQuery(""); // ← Punkt 1+2: Eingabe leeren
    setResults([]);
    setOpen(false);
    setNoResults(false);
  };

  return (
    <div className="relative w-64">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Künstler suchen..."
        className="w-full border rounded px-3 py-1"
      />

      {/* Dropdown mit Treffern */}
      {open && results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-60 overflow-y-auto">
          {results.map((artist) => (
            <li
              key={artist.id}
              onClick={() => handleSelect(artist.id, artist.name)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
            >
              {artist.name}
            </li>
          ))}
        </ul>
      )}

      {/* Kein Treffer – Punkt 4 */}
      {noResults && (
        <p className="absolute z-10 w-full bg-white border rounded shadow mt-1 px-3 py-2 text-sm text-gray-400">
          Keine Künstler/-innen gefunden
        </p>
      )}
    </div>
  );
}
