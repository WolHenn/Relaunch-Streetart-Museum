// src/pages/Dashboard.tsx
import { Routes, Route, NavLink } from "react-router-dom";
import ArtistSection from "../admin/artists";
import LocationSection from "../admin/locations";
import KnowledgeSection from "../admin/knowledgebase";

export default function Dashboard({ logout }: { logout: () => void }) {
  return (
    <div>
      <header
        style={{
          borderBottom: "1px solid #ccc",
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <nav style={{ display: "flex", gap: "2rem" }}>
          <NavLink
            to="/admin/artists"
            className={({ isActive }) =>
              isActive ? "tab-active" : "tab-inactive"
            }
          >
            Künstler/-innen
          </NavLink>
          <NavLink
            to="/admin/locations"
            className={({ isActive }) =>
              isActive ? "tab-active" : "tab-inactive"
            }
          >
            Orte & Wege
          </NavLink>
          <NavLink
            to="/admin/knowledgebase"
            className={({ isActive }) =>
              isActive ? "tab-active" : "tab-inactive"
            }
          >
            Wissenswertes
          </NavLink>
        </nav>
        <button onClick={logout}>Logout</button>
      </header>

      <main style={{ padding: "2rem" }}>
        <Routes>
          <Route path="artists" element={<ArtistSection />} />
          <Route path="locations" element={<LocationSection />} />
          <Route path="knowledgebase" element={<KnowledgeSection />} />
          {/* Startseite nach dem Login */}
          <Route path="/" element={<h2>Willkommen im Admin-Bereich</h2>} />
        </Routes>
      </main>
    </div>
  );
}
