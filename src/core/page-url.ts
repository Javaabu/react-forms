"use client"

import * as React from "react"

import { useFormsConfig } from "./provider"

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange)
  return () => window.removeEventListener("popstate", onChange)
}

const browserUrl = () => window.location.href
// Nothing on the server, and on the first client render while hydrating, so both render the same.
const serverUrl = () => ""

/**
 * The current page's URL, safe for server rendering. In order: the router's
 * `useUrl()` (Inertia's `usePage().url`), `FormsProvider url`, or the browser's
 * URL, which is `""` on the server and while hydrating, then the real one.
 */
export function usePageUrl(): string {
  const { router, url } = useFormsConfig()
  const fromRouter = router?.useUrl?.()
  const fromBrowser = React.useSyncExternalStore(subscribe, browserUrl, serverUrl)
  return fromRouter ?? url ?? fromBrowser
}

/** The query string of `usePageUrl()`. */
export function usePageQuery(): URLSearchParams {
  const url = usePageUrl()
  return React.useMemo(() => {
    const start = url.indexOf("?")
    if (start === -1) return new URLSearchParams()
    const end = url.indexOf("#", start)
    return new URLSearchParams(url.slice(start + 1, end === -1 ? undefined : end))
  }, [url])
}
