import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const src = import.meta.dirname

function modules(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return modules(path)
    return name.endsWith(".tsx") && !name.endsWith(".test.tsx") ? [path] : []
  })
}

// Declarations must name React's types through the module's own import. Without one, TypeScript reaches into
// node_modules/@types/react, which fails (TS2883) when the package is built inside a pnpm store (#20).
it("imports React in every .tsx module, so declarations are portable", () => {
  const missing = modules(src).filter((path) => !/from "react"/.test(readFileSync(path, "utf8")))
  expect(missing.map((path) => relative(src, path))).toEqual([])
})
