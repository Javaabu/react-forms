import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

import { mockLaravel } from "./mock-laravel"

/** One page per integration, rendered against the source. `pnpm examples` serves them, `pnpm examples:build` builds them. */
const pages = ["index", "onu", "html", "shadcn", "inertia", "fetch"]

export default defineConfig({
  root: import.meta.dirname,
  plugins: [react(), tailwindcss(), mockLaravel()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page, resolve(import.meta.dirname, `${page}.html`)])),
    },
  },
})
