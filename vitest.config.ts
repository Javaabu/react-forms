import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    // Onu imports `lucide-react/dynamic` without an extension; let Vite resolve it as an app bundler would.
    server: { deps: { inline: [/@javaabu\/onu/] } },
  },
})
