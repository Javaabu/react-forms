// The `<script>` tag build, `dist/forms.iife.js`: everything in `@javaabu/forms` and the plain HTML adapter on
// `window.JavaabuForms`, with React and ReactDOM bundled in (React 19 ships no UMD build), so a page can use the
// forms with no bundler and no JSX:
//
//   <script src="https://unpkg.com/@javaabu/forms/dist/forms.iife.js"></script>
//   <script>
//     const { h, mount, Form, Text, Submit } = JavaabuForms
//     mount("#app", h(Form, { action: "/users" }, h(Text, { name: "name" }), h(Submit)))
//   </script>
//
// Use the ES module entries instead when the page has a bundler or already loads React.
import * as React from "react"
import { createRoot, type Root } from "react-dom/client"

import { FormsProvider, type FormsProviderProps } from "./core/provider"

export * from "./index"
export { html, pageWindow } from "./html"

/** The bundled React, for hooks and `createElement` in pages without a bundler. */
export { React }

/** The bundled @javaabu/i18n, the translator the components use: `JavaabuForms.i18n.setLocale("dv")`. */
export * as i18n from "@javaabu/i18n"

/** `React.createElement`, short enough to write forms by hand: `h(Text, { name: "name" })`. */
export const h = React.createElement

/** The `FormsProvider` options `mount()` wraps the node in: `ui`, `errors`, `old`, `router`, `settings`… */
export type MountOptions = Omit<FormsProviderProps, "children">

/**
 * Renders `node` into `target` (an element or a selector), wrapped in a `FormsProvider` with `options`.
 * Returns the React root; call `root.unmount()` to remove it.
 */
export function mount(target: Element | string, node: React.ReactNode, options: MountOptions = {}): Root {
  const element = typeof target === "string" ? document.querySelector(target) : target
  if (!element) {
    throw new Error(`JavaabuForms.mount: no element matches "${String(target)}".`)
  }
  const root = createRoot(element)
  root.render(React.createElement(FormsProvider, options, node))
  return root
}
