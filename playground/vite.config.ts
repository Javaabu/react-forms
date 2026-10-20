import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

/** A page that renders every component against the source, for manual and screenshot checks. */
export default defineConfig({
  root: import.meta.dirname,
  plugins: [react(), tailwindcss()],
})
