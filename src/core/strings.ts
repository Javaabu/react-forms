"use client"

import * as React from "react"
import { makeReplacements } from "@javaabu/i18n"
import { useTranslation } from "@javaabu/i18n/react"

import { locales, en, type FormsMessages } from "./locales"
import { useFormsConfig } from "./provider"

/** The namespace and group of the package lines, as in javaabu/forms: `forms::strings.nothing_selected`. */
export const STRINGS_PREFIX = "forms::strings."

export type FormsMessageKey = keyof FormsMessages
export type Replace = Record<string, string | number>

/** The bundled line for a locale (`dv`, `dv_MV`, `en-GB`), falling back to English. */
export function bundledLine(key: FormsMessageKey, locale: string): string {
  const code = locale.split(/[-_]/)[0]?.toLowerCase() ?? "en"
  return (locales[code] ?? en)[key] ?? en[key]
}

/**
 * The package strings and the label translator, through `@javaabu/i18n`.
 *
 * `t("nothing_selected")` looks up `forms::strings.nothing_selected`. Lines your app
 * loads (e.g. `lang/vendor/forms/dv/strings.php` through js-localization) win; the
 * bundled `en` / `dv` lines are the fallback. `translate("Company Name")` is `__()`,
 * like Blade's `trans()` on generated labels, unless `FormsProvider translate` is set.
 */
export function useFormsTranslation() {
  const { __, has, locale, direction } = useTranslation()
  const { translate: custom } = useFormsConfig()

  const t = React.useCallback(
    (key: FormsMessageKey, replace: Replace = {}): string => {
      const full = STRINGS_PREFIX + key
      if (has(full)) return String(__(full, replace))
      return makeReplacements(bundledLine(key, locale), replace)
    },
    [__, has, locale],
  )

  const translate = React.useCallback(
    (text: string) => (!text ? text : custom ? custom(text) : String(__(text))),
    [custom, __],
  )

  return { t, translate, locale, direction }
}
