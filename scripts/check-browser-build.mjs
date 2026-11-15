// Opens examples/script-tag.html with the built dist/forms.iife.js, as a browser would without a bundler,
// and checks the form renders in Dhivehi. Run after `pnpm build`: `pnpm test:browser-build`.
import console from "node:console"
import { existsSync, readFileSync } from "node:fs"
import process from "node:process"
import { setTimeout as sleep } from "node:timers/promises"
import { URL } from "node:url"
import { JSDOM, VirtualConsole } from "jsdom"

const root = new URL("..", import.meta.url)
const bundle = new URL("dist/forms.iife.js", root)
const page = new URL("examples/script-tag.html", root)

if (!existsSync(bundle)) {
  console.error("dist/forms.iife.js is missing: run `pnpm build` first.")
  process.exit(1)
}

const errors = []
const virtualConsole = new VirtualConsole()
virtualConsole.on("jsdomError", (error) => errors.push(error.stack ?? String(error)))
virtualConsole.on("error", (...args) => errors.push(args.join(" ")))

// Inline the bundle instead of loading it over file:, so the check doesn't depend on jsdom's resource loader.
const html = readFileSync(page, "utf8").replace(
  '<script src="../dist/forms.iife.js"></script>',
  () => `<script>${readFileSync(bundle, "utf8")}</script>`,
)
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: page.href, virtualConsole })
const { window } = dom

const fail = (message) => {
  console.error(`script-tag build: ${message}`)
  for (const error of errors) console.error(error)
  process.exit(1)
}

// React renders asynchronously; wait for the form.
for (let i = 0; i < 50 && !window.document.querySelector("#app form"); i++) {
  await sleep(20)
}

const doc = window.document
if (typeof window.JavaabuForms?.mount !== "function") fail("window.JavaabuForms.mount is missing")
if (!doc.querySelector("#app form")) fail("the example form did not render")
for (const name of ["name", "email", "topic", "message"]) {
  if (!doc.querySelector(`#app [name="${name}"]`)) fail(`the "${name}" field did not render`)
}
if (doc.querySelector('#app [name="name"]').value !== "ޢަލީ ޙަސަން") fail("the model value was not bound")
if (!doc.body.textContent.includes("އީމެއިލް ލިޔުއްވާ.")) fail("the validation error was not shown")
if (window.JavaabuForms.i18n.getLocale() !== "dv") fail("the locale is not Dhivehi")
if (errors.length) fail("the page logged errors")

console.log("script-tag build: examples/script-tag.html renders with dist/forms.iife.js")
window.close()
