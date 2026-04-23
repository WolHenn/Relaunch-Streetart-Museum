import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import ArtistsPage from "./ArtistsPage";
import LocationSection from "../components/locations/LocationSection";
import KnowledgeSection from "../components/knowledgebase/KnowledgeSection";

export default function Dashboard({ logout }: { logout: () => void }) {
    return (
        <div>
            <header style={{
                borderBottom: "1px solid #ccc",
                padding: "1rem",
                display: "flex",
                justifyContent: "space-between",
            }}>
                <nav style={{ display: "flex", gap: "2rem" }}>
                    {/* Pfade sind relativ zu /admin/ */}
                    <NavLink
                        to="/admin/artists"
                        className={({ isActive }) => isActive ? "tab-active" : "tab-inactive"}
                    >
                        Künstler/-innen
                    </NavLink>
                    <NavLink
                        to="/admin/locations"
                        className={({ isActive }) => isActive ? "tab-active" : "tab-inactive"}
                    >
                        Orte & Wege
                    </NavLink>
                    <NavLink
                        to="/admin/knowledgebase"
                        className={({ isActive }) => isActive ? "tab-active" : "tab-inactive"}
                    >
                        Wissenswertes
                    </NavLink>
                </nav>
                <button onClick={logout}>Logout</button>
            </header>

            <main style={{ padding: "2rem" }}>
                <Routes>
                    {/* Startseite nach Login → direkt zu Künstlern */}
                    <Route index element={<Navigate to="artists" replace />} />
                    <Route path="artists" element={<ArtistsPage />} />
                    <Route path="locations" element={<LocationSection />} />
                    <Route path="knowledgebase" element={<KnowledgeSection />} />
                </Routes>
            </main>
        </div>
    );
}