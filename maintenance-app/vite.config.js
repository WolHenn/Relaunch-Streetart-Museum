import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // Aktiviert das Abfragen der Dateien
    },
    host: true, // Damit der Zugriff von außen klappt
    strictPort: true,
    port: 5173,
  },
})
