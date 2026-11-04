"use client"

import * as React from "react"

import type { FormsAdapter, FormsComponents, FormsServices } from "./adapter"
import type { FormErrors } from "./errors"
import type { FormsRouter } from "./router"
import { html } from "../adapters/html"

/** Who may do what, for `can` props (`ConditionalLink`, `NoItems`). Like Laravel's `Gate::allows`. */
export type Authorize = (ability: string, argument?: unknown, guard?: string | null) => boolean

/**
 * App settings the Blade components read with `get_setting()`: `per_page`,
 * `max_upload_file_size` and `max_image_file_size` (in KB), `default_lat`, `default_lng`, …
 */
export type FormsSettings = Record<string, unknown>

export interface FormsConfig {
  /** The UI framework adapter: `onu` from `@javaabu/forms/onu`, `createShadcnAdapter(…)`, or your own. Default: plain HTML. */
  ui?: FormsAdapter
  /** Replace single components of the adapter: `{ Select: MySelect }`. */
  components?: Partial<FormsComponents>
  /**
   * How forms submit when they have no `onSubmit`: `inertia` from `@javaabu/forms/inertia`,
   * `fetchRouter`, or your own. Default: a native browser submit.
   */
  router?: FormsRouter | null
  /**
   * Translates labels and titles generated from field names, like Blade's `trans()`.
   * Default: `__()` from `@javaabu/i18n`.
   */
  translate?: (text: string) => string
  /** CSRF token for `_token` inputs and uploads. Default: the `csrf-token` meta tag. */
  csrfToken?: string | null
  /** Old input for every form (Laravel's `session()->getOldInput()`). A form's `old` prop wins. */
  old?: Record<string, unknown> | null
  /**
   * Validation errors for every form, keyed by field (`{ email: ["…"] }`) or by error bag
   * (`{ createUser: { email: "…" } }`). A form's `errors` prop wins. The Inertia router reads page props itself.
   */
  errors?: FormErrors | Record<string, FormErrors> | null
  /** Resolves `can` / `arg` / `guard` props. Without it, `can` checks fail closed. */
  authorize?: Authorize
  /** Values for `get_setting()` lookups. */
  settings?: FormsSettings
}

export interface FormsContextValue {
  components: FormsComponents
  services: FormsServices
  adapter: string
  router: FormsRouter | null
  translate?: (text: string) => string
  csrfToken?: string | null
  old: Record<string, unknown> | null
  errors: FormErrors | Record<string, FormErrors> | null
  authorize?: Authorize
  settings: FormsSettings
}

/** The `get_setting()` defaults javaabu projects ship with. */
export const DEFAULT_SETTINGS: FormsSettings = {
  per_page: 20,
  max_upload_file_size: 1024 * 10,
  max_image_file_size: 1024 * 2,
}

const browserServices: FormsServices = {
  confirm: async ({ title, description }) =>
    typeof window === "undefined" ? false : window.confirm([title, description].filter(Boolean).join("\n\n")),
  notify: (message) => {
    if (typeof window !== "undefined") window.alert(message)
  },
}

function resolve(parent: FormsContextValue | null, config: FormsConfig): FormsContextValue {
  const base = parent ?? {
    components: html.components as FormsComponents,
    services: browserServices,
    adapter: html.name,
    router: null,
    old: null,
    errors: null,
    settings: DEFAULT_SETTINGS,
  }
  const ui = config.ui
  return {
    components: { ...base.components, ...ui?.components, ...config.components } as FormsComponents,
    services: {
      confirm: ui?.confirm ?? base.services.confirm,
      notify: ui?.notify ?? base.services.notify,
    },
    adapter: ui?.name ?? base.adapter,
    router: config.router !== undefined ? config.router : base.router,
    translate: config.translate ?? base.translate,
    csrfToken: config.csrfToken !== undefined ? config.csrfToken : base.csrfToken,
    old: config.old !== undefined ? config.old : base.old,
    errors: config.errors !== undefined ? config.errors : base.errors,
    authorize: config.authorize ?? base.authorize,
    settings: { ...base.settings, ...config.settings },
  }
}

const FormsContext = React.createContext<FormsContextValue | null>(null)

export interface FormsProviderProps extends FormsConfig {
  children?: React.ReactNode
}

/**
 * App-wide configuration, the counterpart of `config/forms.php` and `get_setting()`:
 * the UI adapter, component overrides, the router, old input, errors, settings.
 * Optional: without it, components render plain HTML. Nested providers override
 * their parent's values, so a part of the page can use other components.
 */
export function FormsProvider({ children, ...config }: FormsProviderProps) {
  const parent = React.useContext(FormsContext)
  const value = React.useMemo(
    () => resolve(parent, config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      parent,
      config.ui,
      config.components,
      config.router,
      config.translate,
      config.csrfToken,
      config.old,
      config.errors,
      config.authorize,
      config.settings,
    ],
  )
  return <FormsContext.Provider value={value}>{children}</FormsContext.Provider>
}

// Resolved on first use: the HTML adapter imports this module, so it may not be evaluated yet at load time.
let fallback: FormsContextValue | undefined

/** The resolved configuration. */
export function useFormsConfig(): FormsContextValue {
  return React.useContext(FormsContext) ?? (fallback ??= resolve(null, {}))
}

/** The components of the active adapter, with overrides and HTML fallbacks applied. */
export function useUi(): FormsComponents {
  return useFormsConfig().components
}

/** `confirm()` and `notify()` of the active adapter. */
export function useFormsServices(): FormsServices {
  return useFormsConfig().services
}

/** `get_setting($key)`. */
export function useSetting<T = unknown>(key: string): T | undefined {
  return useFormsConfig().settings[key] as T | undefined
}

/** The CSRF token from the provider or the `<meta name="csrf-token">` tag. */
export function useCsrfToken(): string | null {
  const { csrfToken } = useFormsConfig()
  if (csrfToken !== undefined) return csrfToken
  if (typeof document === "undefined") return null
  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? null
}
