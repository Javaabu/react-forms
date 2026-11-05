"use client"

import * as React from "react"

import { withQuery } from "../components/select-cascade"
import { normalizeOptions } from "../support/options"
import type { RemoteOptions, SelectOption } from "./adapter"

export interface RemoteOptionsState {
  options: SelectOption[]
  loading: boolean
  error: boolean
}

/**
 * Searches a `Select2 isAjax` endpoint, for adapters without their own async select:
 * `GET url?filter[search]=<query>&fields=id,name` (debounced), reading a JSON list
 * or a resource collection's `data`.
 */
export function useRemoteOptions(remote: RemoteOptions | undefined, query: string, delay = 250): RemoteOptionsState {
  const [state, setState] = React.useState<RemoteOptionsState>({ options: [], loading: false, error: false })
  const active = !!remote && query.length >= (remote.minChars ?? 0)
  const key = remote ? JSON.stringify([remote.url, remote.searchParam, remote.params, remote.dependsOn, query]) : ""

  React.useEffect(() => {
    if (!remote || !active) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, loading: true, error: false }))
      fetch(withQuery(remote.url, { ...remote.params, ...(query ? { [remote.searchParam]: query } : {}) }), {
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
            options: normalizeOptions(items as Record<string, unknown>[], {
              idField: remote.valueKey,
              nameField: remote.labelKey,
            }),
            loading: false,
            error: false,
          })
        })
        .catch((error: unknown) => {
          if ((error as Error).name === "AbortError") return
          setState({ options: [], loading: false, error: true })
        })
    }, delay)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
    // `key` stands for `remote` and `query`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active, delay])

  return active ? state : { options: [], loading: false, error: false }
}
