"use client"

import * as React from "react"
import { useOnu } from "@javaabu/onu"

import { locales, type FormsMessages } from "../locales"

/** Who may do what, for `can` props (`ConditionalLink`, `NoItems`). Like Laravel's `Gate::allows`. */
export type Authorize = (ability: string, argument?: unknown, guard?: string | null) => boolean

/**
 * App settings the Blade components read with `get_setting()`: `per_page`,
 * `max_upload_file_size` and `max_image_file_size` (in KB), `default_lat`, `default_lng`, …
 */
export type FormsSettings = Record<string, unknown>

export interface FormsConfig {
  /** Override package strings (merged over the active locale's). */
  messages?: Partial<FormsMessages>
  /**
   * Translates labels and titles generated from field names, like Blade's `trans()`.
   * Pass your app's translator (e.g. `laravel-react-i18n`'s `t`). Default: unchanged.
   */
  translate?: (text: string) => string
  /** CSRF token for `_token` inputs and uploads. Default: the `csrf-token` meta tag. */
  csrfToken?: string | null
  /** Old input for every form (e.g. an Inertia shared prop). A form's `old` prop wins. */
  old?: Record<string, unknown> | null
  /** Resolves `can` / `arg` / `guard` props. Without it, `can` checks fail closed. */
  authorize?: Authorize
  /** Values for `get_setting()` lookups. */
  settings?: FormsSettings
}

export interface FormsContextValue extends Required<Pick<FormsConfig, "translate" | "settings">> {
  messages: FormsMessages
  csrfToken?: string | null
  old: Record<string, unknown> | null
  authorize?: Authorize
}

/** The `get_setting()` defaults javaabu projects ship with. */
export const DEFAULT_SETTINGS: FormsSettings = {
  per_page: 20,
  max_upload_file_size: 1024 * 10,
  max_image_file_size: 1024 * 2,
}

const identity = (text: string) => text

const FormsContext = React.createContext<FormsConfig | null>(null)

export interface FormsProviderProps extends FormsConfig {
  children?: React.ReactNode
}

/**
 * App-wide configuration, the counterpart of `config/forms.php`, the package
 * translations and `get_setting()`. Optional: every component works without it.
 * Nested providers override their parent's values.
 */
export function FormsProvider({ children, ...config }: FormsProviderProps) {
  const parent = React.useContext(FormsContext)
  const value = React.useMemo<FormsConfig>(
    () => ({
      ...parent,
      ...config,
      messages: { ...parent?.messages, ...config.messages },
      settings: { ...parent?.settings, ...config.settings },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parent, config.messages, config.translate, config.csrfToken, config.old, config.authorize, config.settings],
  )
  return <FormsContext.Provider value={value}>{children}</FormsContext.Provider>
}

/** The resolved configuration, with the active Onu locale's strings. */
export function useFormsConfig(): FormsContextValue {
  const config = React.useContext(FormsContext)
  const { locale } = useOnu()
  const code = locale.code.split("-")[0] ?? "en"
  return React.useMemo(
    () => ({
      messages: { ...(locales[code] ?? locales.en!), ...config?.messages },
      translate: config?.translate ?? identity,
      csrfToken: config?.csrfToken,
      old: config?.old ?? null,
      authorize: config?.authorize,
      settings: { ...DEFAULT_SETTINGS, ...config?.settings },
    }),
    [config, code],
  )
}

/** Replaces Laravel-style `:placeholders`, longest names first (so `:widthpx` does not need a separator). */
export function replacePlaceholders(text: string, replace?: Record<string, string | number>): string {
  if (!replace) return text
  const keys = Object.keys(replace).sort((a, b) => b.length - a.length)
  let out = text
  for (const key of keys) out = out.split(`:${key}`).join(String(replace[key]))
  return out
}

/** `t("fileHint", { types, size })` with the package strings of the active locale. */
export function useFormsTranslation() {
  const { messages, translate } = useFormsConfig()
  const t = React.useCallback(
    (key: keyof FormsMessages, replace?: Record<string, string | number>) =>
      replacePlaceholders(messages[key], replace),
    [messages],
  )
  return { t, translate }
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
