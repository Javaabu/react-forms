import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

/** The `<script>` tag build: `window.JavaabuForms`, with React, ReactDOM and @javaabu/i18n bundled in. */
export default defineConfig({
  plugins: [react()],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    reportCompressedSize: false,
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(import.meta.dirname, "src/browser.ts"),
      name: "JavaabuForms",
      formats: ["iife"],
      fileName: () => "forms.iife.js",
    },
  },
})
