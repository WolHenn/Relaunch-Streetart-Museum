import { useState } from "react";
import type { ArtistImage } from "../../services/artist_types";
import { authenticatedFetch } from "../../api/apiClient";

interface Props {
    artistId: number;
    image?: ArtistImage;    // leer = neu anlegen, befüllt = bearbeiten
    onSave: () => void;
    onCancel: () => void;
}

const BASE_URL = "http://localhost:8082";

export default function ArtistImageForm({ artistId, image, onSave, onCancel }: Props) {
    const isEditMode = !!image;

    const [formData, setFormData] = useState({
        artist_id:        artistId,
        orientation:      image?.orientation      ?? "landscape",
        url:              image?.url              ?? "",
        alt:              image?.alt              ?? "",
        title:            image?.title            ?? "",
        location:         image?.location         ?? "",
        coords:           image?.coords           ?? "",
        imgDate:          image?.imgDate          ?? "",
        attribution:      image?.attribution      ?? "",
        shortdescription: image?.shortdescription ?? "",
        downloadUrl:      image?.downloadUrl      ?? "",
        thumbnailUrl:     image?.thumbnailUrl     ?? "",
        imgType:          image?.imgType          ?? "",
    });

    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setUploadFile(file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!formData.url && !uploadFile) {
            setError("Bitte eine URL eingeben oder eine Datei hochladen.");
            return;
        }
        setSaving(true);
        setError(null);

        try {
            // Upload falls Datei gewählt
            if (uploadFile) {
                const uploadData = new FormData();
                uploadData.append("file", uploadFile);
                uploadData.append("artistId", String(artistId));

                // Hier später den Upload-Endpunkt aufrufen
                // const uploadRes = await authenticatedFetch(`${BASE_URL}/upload`, {
                //     method: "POST",
                //     body: uploadData,
                // });
                // const uploadResult = await uploadRes.json();
                // formData.url = uploadResult.url;
                // formData.thumbnailUrl = uploadResult.thumbnailUrl;

                console.log("Upload noch nicht implementiert:", uploadFile.name);
            }

            // Metadaten speichern
            const method = isEditMode ? "PATCH" : "POST";
            const url = isEditMode
                ? `${BASE_URL}/images/${image!.id}`
                : `${BASE_URL}/images`;

            const res = await authenticatedFetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSave();
            } else {
                setError("Fehler beim Speichern.");
            }
        } catch {
            setError("Netzwerkfehler.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-1">
            <h4 className="font-semibold mb-2 text-sm">
                {isEditMode ? "Bild bearbeiten" : "Neues Bild hinzufügen"}
            </h4>

            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <label className="block font-medium mb-1">Ausrichtung</label>
                    <select
                        name="orientation"
                        value={formData.orientation}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    >
                        <option value="landscape">Landscape</option>
                        <option value="portrait">Portrait</option>
                    </select>
                </div>
                <div>
                    <label className="block font-medium mb-1">Bildtyp</label>
                    <input
                        name="imgType"
                        value={formData.imgType}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                        placeholder="z.B. graffiti, mural"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Alt-Text</label>
                    <input
                        name="alt"
                        value={formData.alt}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Titel</label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Datum</label>
                    <input
                        name="imgDate"
                        type="date"
                        value={formData.imgDate as string}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Ort</label>
                    <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Koordinaten</label>
                    <input
                        name="coords"
                        value={formData.coords}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                        placeholder="z.B. 52.5200,13.4050"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Attribution</label>
                    <input
                        name="attribution"
                        value={formData.attribution}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block font-medium mb-1">Kurzbeschreibung</label>
                    <textarea
                        name="shortdescription"
                        value={formData.shortdescription}
                        onChange={handleChange}
                        rows={2}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>

                {/* Bild-URL oder Upload */}
                <div className="col-span-2 border-t pt-2 mt-1">
                    <p className="font-medium mb-2">Bilddatei</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">
                                URL manuell eingeben
                            </label>
                            <input
                                name="url"
                                value={formData.url}
                                onChange={handleChange}
                                className="w-full border rounded px-2 py-1"
                                placeholder="assets/images/artwork/..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">
                                Oder Datei hochladen
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-xs"
                            />
                        </div>
                    </div>

                    {/* Vorschau */}
                    {previewUrl && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Vorschau:</p>
                            <img
                                src={previewUrl}
                                alt="Vorschau"
                                className="w-32 h-32 object-cover rounded border"
                            />
                        </div>
                    )}
                </div>

                {/* Thumbnail + Download URL */}
                <div>
                    <label className="block font-medium mb-1">Thumbnail-URL</label>
                    <input
                        name="thumbnailUrl"
                        value={formData.thumbnailUrl}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                        placeholder="assets/images/artwork/.../thumbnails/..."
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Download-URL</label>
                    <input
                        name="downloadUrl"
                        value={formData.downloadUrl}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                        placeholder="assets/images/artwork/.../download/..."
                    />
                </div>
            </div>

            <div className="flex gap-2 mt-3">
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                    {saving ? "Speichert..." : "Speichern"}
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                >
                    Abbrechen
                </button>
            </div>
        </div>
    );
}