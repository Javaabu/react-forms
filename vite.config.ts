import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}
const externals = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]
const isExternal = (id: string) =>
  externals.some((dep) => id === dep || id.startsWith(`${dep}/`)) || /^(react|react-dom)(\/|$)/.test(id)

/** Library entry points, mirrored by package.json `exports`. */
const entries = {
  index: "src/index.ts",
  "editor/index": "src/editor/index.tsx",
  "maps/index": "src/maps/index.tsx",
}

export default defineConfig({
  plugins: [react()],
  build: {
    reportCompressedSize: false,
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, resolve(__dirname, v)])),
      formats: ["es"],
    },
    rollupOptions: {
      external: isExternal,
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        // Every module may run on the client; mark them for React Server Components.
        banner: '"use client";',
      },
    },
  },
})
