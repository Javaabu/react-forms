import { getValidationErrors, type FormErrors } from "./errors"

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete"

/** A Laravel Wayfinder route or action: `store()`, `update(user)`. */
export interface RouteDefinition {
  url: string
  method: string
}

/** Wayfinder's form variant: `update.form(user)` → `{ action: "/users/1?_method=PATCH", method: "post" }`. */
export interface RouteFormDefinition {
  action: string
  method: string
}

/**
 * What `Form action` accepts: a URL, a Wayfinder route object, or a Wayfinder
 * route function. A function is called with the form's model, so
 * `<Form model={user} action={update}>` posts to `update(user)`.
 */
export type FormAction =
  string | RouteDefinition | RouteFormDefinition | ((...args: never[]) => RouteDefinition | RouteFormDefinition)

export interface ResolvedAction {
  url: string | undefined
  /** The route's method, when it has one. */
  method: HttpMethod | undefined
}

const METHODS: HttpMethod[] = ["get", "post", "put", "patch", "delete"]

function toMethod(value: unknown): HttpMethod | undefined {
  const m = typeof value === "string" ? value.toLowerCase() : ""
  if (m === "head") return "get"
  return (METHODS as string[]).includes(m) ? (m as HttpMethod) : undefined
}

/** Moves a `_method` query parameter (Wayfinder's `.form()` spoofing) into the method. */
function extractSpoofedMethod(url: string): { url: string; method?: HttpMethod } {
  const index = url.indexOf("?")
  if (index === -1) return { url }
  const params = new URLSearchParams(url.slice(index + 1))
  const spoofed = toMethod(params.get("_method"))
  if (!spoofed) return { url }
  params.delete("_method")
  const query = params.toString()
  return { url: url.slice(0, index) + (query ? `?${query}` : ""), method: spoofed }
}

/** Resolves `Form action` to a URL and method. */
export function resolveAction(action: FormAction | null | undefined, model?: unknown): ResolvedAction {
  if (action === null || action === undefined) return { url: undefined, method: undefined }
  if (typeof action === "string") return { url: action, method: undefined }
  if (typeof action === "function") {
    const call = action as (model?: unknown) => RouteDefinition | RouteFormDefinition
    return resolveAction(model === undefined || model === null ? call() : call(model))
  }
  if ("url" in action && typeof action.url === "string") return { url: action.url, method: toMethod(action.method) }
  if ("action" in action && typeof action.action === "string") {
    const { url, method } = extractSpoofedMethod(action.action)
    return { url, method: method ?? toMethod(action.method) }
  }
  return { url: undefined, method: undefined }
}

/** `PUT`, `PATCH` and `DELETE` are sent as `POST` with `_method`, as Laravel expects from HTML forms. */
export function isSpoofed(method: HttpMethod): boolean {
  return method === "put" || method === "patch" || method === "delete"
}

/** Options of an Inertia-style visit. Routers ignore what they don't support. */
export interface VisitOptions {
  preserveScroll?: boolean | "errors"
  preserveState?: boolean | "errors"
  replace?: boolean
  only?: string[]
  except?: string[]
  headers?: Record<string, string>
  [option: string]: unknown
}

export interface SubmitRequest {
  url: string
  /** The real method. For `put` / `patch` / `delete`, `data` also carries `_method`. */
  method: HttpMethod
  data: FormData
  form: HTMLFormElement
  errorBag?: string
  options: VisitOptions
}

export interface SubmitCallbacks {
  onStart: () => void
  /** Upload progress, 0–100. */
  onProgress: (percentage: number) => void
  onSuccess: (result?: unknown) => void
  /** Validation failed: show these errors. */
  onError: (errors: FormErrors, message?: string | null) => void
  /** Anything else went wrong (network, server error). */
  onFailure: (error: unknown) => void
  onFinish: () => void
}

/**
 * How forms submit and where page-level errors come from. `inertia` from
 * `@javaabu/forms/inertia` and `fetchRouter` implement it; so can your own.
 */
export interface FormsRouter {
  name: string
  submit: (request: SubmitRequest, callbacks: SubmitCallbacks) => void
  /** A hook: the current page's errors, every bag (Inertia's `usePage().props.errors`). */
  usePageErrors?: () => unknown
  /** A hook: the current page's old input. */
  useOldInput?: () => Record<string, unknown> | null | undefined
}

/** `FormData` as an object; repeated names (checkbox groups, `tags[]`) become arrays. */
export type FormValues = Record<string, FormDataEntryValue | FormDataEntryValue[]>

export function formDataToObject(data: FormData): FormValues {
  const out: FormValues = {}
  data.forEach((value, key) => {
    const existing = out[key]
    if (existing === undefined) out[key] = value
    else out[key] = Array.isArray(existing) ? [...existing, value] : [existing, value]
  })
  return out
}

/** Appends `FormData` to a URL's query string, for GET submits. Files are skipped. */
export function withFormData(url: string, data: FormData): string {
  const params = new URLSearchParams()
  data.forEach((value, key) => {
    if (typeof value === "string") params.append(key, value)
  })
  const query = params.toString()
  return query ? `${url}${url.includes("?") ? "&" : "?"}${query}` : url
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined
}

/**
 * Submits with `XMLHttpRequest` (for upload progress) and reads Laravel's JSON
 * responses: a 422 shows the validation errors, a 2xx calls `onSuccess` with
 * the parsed body. Navigating afterwards is up to `Form onSuccess`.
 */
export const fetchRouter: FormsRouter = {
  name: "fetch",
  submit({ url, method, data, options }, callbacks) {
    const xhr = new XMLHttpRequest()
    const target = method === "get" ? withFormData(url, data) : url
    xhr.open(method === "get" ? "GET" : "POST", target)
    xhr.setRequestHeader("Accept", "application/json")
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
    const token = data.get("_token")
    if (typeof token === "string" && token) xhr.setRequestHeader("X-CSRF-TOKEN", token)
    else {
      const xsrf = readCookie("XSRF-TOKEN")
      if (xsrf) xhr.setRequestHeader("X-XSRF-TOKEN", xsrf)
    }
    for (const [key, value] of Object.entries(options.headers ?? {})) xhr.setRequestHeader(key, value)
    xhr.withCredentials = true
    xhr.upload?.addEventListener("progress", (event) => {
      if (event.lengthComputable) callbacks.onProgress(Math.round((event.loaded / event.total) * 100))
    })

    const body = (): unknown => {
      const type = xhr.getResponseHeader("content-type") ?? ""
      if (!type.includes("json")) return xhr.responseText
      try {
        return JSON.parse(xhr.responseText)
      } catch {
        return xhr.responseText
      }
    }

    xhr.addEventListener("load", () => {
      const parsed = body()
      if (xhr.status >= 200 && xhr.status < 300) callbacks.onSuccess(parsed)
      else {
        const payload = xhr.status === 422 ? getValidationErrors(parsed) : null
        if (payload) callbacks.onError(payload.errors, payload.message)
        else callbacks.onFailure({ status: xhr.status, body: parsed })
      }
      callbacks.onFinish()
    })
    xhr.addEventListener("error", () => {
      callbacks.onFailure(new Error("Network error"))
      callbacks.onFinish()
    })

    callbacks.onStart()
    xhr.send(method === "get" ? null : data)
  },
}
