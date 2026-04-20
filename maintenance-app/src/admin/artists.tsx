import { useEffect, useState } from "react";
import { authenticatedFetch } from "../api/apiClient";
// Importiere deine Typen hier
import type { Artist } from "../services/artist_types";

export default function ArtistSection() {
  // Jetzt nutzt du den zentralen Typ
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authenticatedFetch("http://localhost:8082/artists")
      .then((res) => res.json())
      .then((data) => {
        // Falls deine API das Array direkt oder in einem Unterobjekt liefert:
        const artistData = data.artists || data;
        setArtists(artistData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Laden:", err);
        setLoading(false);
      });
  }, []);

  const deleteArtist = async (id: number) => {
    if (!window.confirm("Soll dieser Künstler wirklich gelöscht werden?"))
      return;

    const response = await authenticatedFetch(
      `http://localhost:8082/artists/${id}`,
      {
        method: "DELETE",
      },
    );

    if (response.ok) {
      // UI aktualisieren, ohne die ganze Seite neu zu laden
      setArtists((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert("Fehler beim Löschen. Möglicherweise keine Berechtigung?");
    }
  };

  if (loading) return <div>Lade Künstler...</div>;

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">Künstlerverwaltung</h3>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100 border-bottom">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {artists.map((artist) => (
            <tr key={artist.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{artist.id}</td>
              <td className="p-2">{artist.name}</td>
              <td className="p-2">
                <button className="bg-blue-500 text-white px-2 py-1 rounded">
                  Bearbeiten
                </button>
              </td>
              <td className="p-2">
                <button 
                  onClick={() => deleteArtist(artist.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                >
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <img src="http://localhost:8082/assets/images/artwork/BlekLeRat/thumb_dummi_1.jpg" alt="" width={100} height={100} />
        <img src="http://localhost:8082/assets/images/artwork/BlekLeRat/thumb_dummi_2.jpg" alt="" width={100} height={100} />
        <img src="http://localhost:8082/assets/images/artwork/BlekLeRat/thumb_dummi_3.jpg" alt="" width={100} height={100} />
        <img src="http://localhost:8082/assets/images/artwork/BlekLeRat/thumb_dummi_4.jpg" alt="" width={100} height={100} />
      </div>
    </div>
  );
}
