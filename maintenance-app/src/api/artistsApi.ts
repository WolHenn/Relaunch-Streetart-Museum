import { authenticatedFetch } from "./apiClient";
import type { Artist, ArtistImage, ApiResponse } from "../services/artist_types";

const BASE_URL = "http://localhost:8082";

// Nur Namen + IDs (für Dropdown, Typeahead, Buttons)
export async function fetchArtistNames(
    initialLetter?: string,
    search?: string
): Promise<{ id: number; name: string }[]> {
    const params = new URLSearchParams({ namesOnly: "true" });
    if (initialLetter) params.append("initialLetter", initialLetter);
    if (search) params.append("search", search);

    const res = await authenticatedFetch(`${BASE_URL}/artists?${params}`);
    const data = await res.json();
    return data.artists ?? [];
}

// Einzelnen Künstler mit allen Bildern holen
export async function fetchArtist(id: number): Promise<Artist> {
    const res = await authenticatedFetch(`${BASE_URL}/artists/${id}`);
    const data = await res.json();
    return data.artist;
}

// Alle Künstler mit Bildern (paginiert)
export async function fetchArtists(
    initialLetter?: string,
    limit = 50,
    offset = 0
): Promise<ApiResponse> {
    const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
    });
    if (initialLetter) params.append("initialLetter", initialLetter);

    const res = await authenticatedFetch(`${BASE_URL}/artists?${params}`);
    return res.json();
}

// Slider-Bilder
export async function fetchSliderImages(): Promise<ArtistImage[]> {
    const res = await authenticatedFetch(`${BASE_URL}/artists?sliderImages=true`);
    const data = await res.json();
    return data.artistsImages ?? [];
}

// Künstler löschen
export async function deleteArtist(id: number): Promise<boolean> {
    const res = await authenticatedFetch(`${BASE_URL}/artists/${id}`, {
        method: "DELETE",
    });
    return res.ok;
}

// Einzelnes Bild löschen
export async function deleteImage(id: number): Promise<boolean> {
    const res = await authenticatedFetch(`${BASE_URL}/images/${id}`, {
        method: "DELETE",
    });
    return res.ok;
}

// Neuen Künstler anlegen
export async function createArtist(data: Partial<Artist>): Promise<boolean> {
    const res = await authenticatedFetch(`${BASE_URL}/artists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.ok;
}

// Vorhandene Künstlerdaten aktualisieren
export async function updateArtist(id: number, data: Partial<Artist>): Promise<boolean> {
    const res = await authenticatedFetch(`${BASE_URL}/artists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.ok;
}