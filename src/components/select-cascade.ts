"use client"

import * as React from "react"
import type { ChoiceOption } from "@javaabu/onu"

import { isEmpty, toFormString } from "../support/data"
import { normalizeOptions } from "../support/options"

/** Appends params to a URL the way jQuery's `$.param` does (`filter[country]=1`). */
export function withQuery(url: string, params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  const add = (key: string, value: unknown) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [k, v] of Object.entries(value)) add(`${key}[${k}]`, v)
    } else if (Array.isArray(value)) {
      for (const v of value) add(`${key}[]`, v)
    } else {
      search.append(key, toFormString(value))
    }
  }
  for (const [key, value] of Object.entries(params)) add(key, value)
  const query = search.toString()
  return query ? `${url}${url.includes("?") ? "&" : "?"}${query}` : url
}

export interface CascadeOptions {
  enabled: boolean
  url?: string
  parentValue: unknown
  filterField?: string
  nameField?: string
  idField?: string
  /** Options rendered with the page (for the parent's value at load), shown until the first response. */
  initialOptions: ChoiceOption[]
}

/**
 * Loads a cascade child's options whenever its parent's value changes, like
 * js-utilities' `data-select-child`: `GET url?filter[<filterField>]=<value>&per_page=-1&fields=id,name`.
 * `:value` in the URL is replaced with the parent's value.
 */
export function useCascadeOptions({
  enabled,
  url,
  parentValue,
  filterField,
  nameField,
  idField,
  initialOptions,
}: CascadeOptions) {
  const value = Array.isArray(parentValue) ? parentValue.map(toFormString).join(",") : toFormString(parentValue)
  const hasParentValue = enabled && !isEmpty(value)
  const [state, setState] = React.useState<{ for: string; options: ChoiceOption[]; error: boolean } | null>(null)

  React.useEffect(() => {
    if (!enabled || !url || !hasParentValue) return
    const controller = new AbortController()
    const id = idField || "id"
    const name = nameField || "name"
    const params: Record<string, unknown> = { fields: `${id},${name}`, per_page: -1, include: "", append: "" }
    if (filterField) params.filter = { [filterField]: value }

    fetch(withQuery(url.replace(":value", encodeURIComponent(value)), params), {
      headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<unknown>
      })
      .then((body) => {
        const items = Array.isArray(body) ? body : ((body as { data?: unknown[] })?.data ?? [])
        setState({
          for: value,
          options: normalizeOptions(items as Record<string, unknown>[], { idField: id, nameField: name }),
          error: false,
        })
      })
      .catch((error: unknown) => {
        if ((error as Error).name === "AbortError") return
        setState({ for: value, options: [], error: true })
      })

    return () => controller.abort()
  }, [enabled, url, value, hasParentValue, filterField, nameField, idField])

  const current = state && state.for === value ? state : null
  const loading = hasParentValue && !current
  return {
    active: enabled,
    hasParentValue,
    loading,
    error: !!current?.error,
    // Until the first response, keep the options rendered with the page so the value keeps its label.
    options: !hasParentValue ? [] : current ? current.options : initialOptions,
  }
}
