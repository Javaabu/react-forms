"use client"

import * as React from "react"
import { Link as InertiaLink, router as inertiaRouter, usePage } from "@inertiajs/react"

import { defineAdapter, type LinkSlotProps } from "../core/adapter"
import type { FormErrors } from "../core/errors"
import { withFormData, type FormsRouter } from "../core/router"

/**
 * Submits forms as Inertia visits, and reads validation errors (every error bag)
 * and old input from the page props:
 *
 * ```tsx
 * <FormsProvider ui={onu} router={inertia}>
 * ```
 *
 * - The visit sends the form's `FormData`, so files upload and `_method` spoofing
 *   works as with a native submit. `GET` forms visit the URL with the fields in the query.
 * - `preserveState` defaults to `"errors"`: a failed submit keeps what the user typed.
 * - Old input comes from an `old` shared prop, when you share one.
 */
export const inertia: FormsRouter = {
  name: "inertia",
  submit({ url, method, data, errorBag, options }, callbacks) {
    const visit = {
      preserveState: "errors" as const,
      ...options,
      errorBag: errorBag ?? null,
      onStart: () => callbacks.onStart(),
      onProgress: (progress?: { percentage?: number }) => {
        if (progress?.percentage !== undefined) callbacks.onProgress(progress.percentage)
      },
      onSuccess: (page: unknown) => callbacks.onSuccess(page),
      onError: (errors: FormErrors) => callbacks.onError(errors),
      onHttpException: (response: unknown) => {
        callbacks.onFailure(response)
      },
      onNetworkError: (error: Error) => {
        callbacks.onFailure(error)
      },
      onFinish: () => callbacks.onFinish(),
    }
    if (method === "get") {
      // Keep `name[]` keys as they are: build the query from the form, as a native GET would.
      inertiaRouter.visit(withFormData(url, data), { ...visit, method: "get" } as never)
    } else {
      // `data` already has `_method` for PUT / PATCH / DELETE, which Laravel needs for multipart bodies.
      inertiaRouter.visit(url, { ...visit, method: "post", data } as never)
    }
  },
  usePageErrors: () => (usePage().props as { errors?: unknown }).errors,
  useOldInput: () => (usePage().props as { old?: Record<string, unknown> | null }).old ?? undefined,
}

function Link({ href, ...props }: LinkSlotProps) {
  // External links and downloads stay plain anchors.
  const external = /^[a-z][a-z\d+.-]*:/i.test(href) || props.target === "_blank" || props.download !== undefined
  if (external || !href || href.startsWith("#")) return <a href={href} {...props} />
  return <InertiaLink href={href} {...(props as Omit<React.ComponentProps<typeof InertiaLink>, "href">)} />
}

/**
 * Inertia's `<Link>` for the `Link` slot, so links inside components (tabs,
 * pagination, link buttons of the HTML adapter) navigate without a full reload:
 * `ui={mergeAdapters(onu, inertiaLinks)}`.
 */
export const inertiaLinks = defineAdapter({ name: "inertia-links", components: { Link } })
