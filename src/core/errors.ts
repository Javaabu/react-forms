/**
 * Laravel validation errors: reading them from responses and thrown values,
 * looking them up by field name, and moving focus to the first invalid field.
 */

/** Field errors keyed by field name in Laravel's dot notation (`items.0.name`). */
export type FormErrors = Record<string, string[] | string | undefined>

/** Errors of a page: the default bag's fields, and named bags (`{ email: "…", createUser: { name: "…" } }`). */
export type PageErrors = Record<string, string[] | string | FormErrors | undefined>

/** Laravel's 422 response body: `{ message, errors: { "items.0.name": ["…"] } }`. */
export interface ValidationPayload {
  message?: string
  errors: FormErrors
}

/** Throw it from `onSubmit` to show field errors without an HTTP client. */
export class ValidationError extends Error {
  readonly errors: FormErrors
  constructor(payload: ValidationPayload | FormErrors, message?: string) {
    const body = isValidationPayload(payload) ? payload : { errors: payload as FormErrors }
    super(message ?? body.message ?? "")
    this.name = "ValidationError"
    this.errors = body.errors
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isMessages(value: unknown): boolean {
  return (
    value === undefined ||
    typeof value === "string" ||
    (Array.isArray(value) && value.every((m) => typeof m === "string"))
  )
}

/** True for a flat error object: `{ field: string | string[] }`. */
export function isFormErrors(value: unknown): value is FormErrors {
  return isRecord(value) && !Array.isArray(value) && Object.values(value).every(isMessages)
}

/** True for `{ errors: { field: string | string[] } }`, Laravel's 422 shape. */
export function isValidationPayload(value: unknown): value is ValidationPayload {
  return isRecord(value) && isFormErrors(value.errors)
}

/** `items[0][name]` → `items.0.name`, the key format Laravel uses for errors. `tags[]` → `tags`. */
export function toDotNotation(name: string): string {
  return name.replace(/\[(\w*)\]/g, ".$1").replace(/\.+$/, "")
}

/**
 * Finds a Laravel validation payload in a thrown value or a parsed response:
 * the payload itself, a `ValidationError`, an axios-style error
 * (`error.response.data`), `{ data }`, `{ body }` or `{ cause }`.
 * Returns `null` when there is none. Use `readValidationErrors` for a fetch `Response`.
 */
export function getValidationErrors(value: unknown): ValidationPayload | null {
  if (value instanceof ValidationError) return { message: value.message || undefined, errors: value.errors }
  if (isValidationPayload(value)) return value
  if (!isRecord(value)) return null
  for (const key of ["response", "data", "body", "cause"] as const) {
    const found: unknown = key === "response" && isRecord(value.response) ? value.response.data : value[key]
    if (found !== undefined && found !== value) {
      const nested = getValidationErrors(found)
      if (nested) return nested
    }
  }
  return null
}

/** Like `getValidationErrors`, and also reads the JSON body of a fetch `Response` (status 422). */
export async function readValidationErrors(value: unknown): Promise<ValidationPayload | null> {
  if (typeof Response !== "undefined" && value instanceof Response) {
    if (value.status !== 422) return null
    try {
      return getValidationErrors(await value.clone().json())
    } catch {
      return null
    }
  }
  return getValidationErrors(value)
}

function toArray(messages: string[] | string | undefined): string[] {
  if (messages === undefined) return []
  return (Array.isArray(messages) ? messages : [messages]).filter(Boolean)
}

/** Flattens errors to `[name, messages]` pairs, dropping empty entries. */
export function errorEntries(errors: FormErrors | null | undefined): [string, string[]][] {
  if (!errors) return []
  return Object.entries(errors)
    .map(([name, messages]) => [name, toArray(messages)] as [string, string[]])
    .filter(([, messages]) => messages.length > 0)
}

/**
 * Picks the errors of one error bag. Inertia shares `{ email: "…" }` normally and
 * `{ createUser: { email: "…" } }` when a visit sets `errorBag`. Without a bag,
 * nested bags are ignored.
 */
export function selectErrorBag(errors: unknown, bag?: string | null): FormErrors | null {
  if (!isRecord(errors)) return null
  if (bag) {
    const bagged = errors[bag]
    return isFormErrors(bagged) ? bagged : null
  }
  const flat: FormErrors = {}
  for (const [key, value] of Object.entries(errors)) {
    if (isMessages(value)) flat[key] = value as string[] | string | undefined
  }
  return flat
}

/**
 * The errors of a field. `address[city]` and `address.city` match `address.city`.
 * Array fields (`tags[]`) also collect their items' errors (`tags.0`, `tags.1`), as
 * Laravel reports a rule on `tags.*` per item. `exact` turns that off.
 */
export function errorsFor(errors: FormErrors | null | undefined, name: string | undefined, exact = false): string[] {
  if (!errors || !name) return []
  const key = toDotNotation(name)
  const own = toArray(errors[name] ?? errors[key])
  if (exact || !name.endsWith("[]")) return own
  const items = Object.keys(errors)
    .filter((k) => k.startsWith(`${key}.`) && /^\d+$/.test(k.slice(key.length + 1)))
    .flatMap((k) => toArray(errors[k]))
  return [...own, ...items]
}

/** Removes the errors of a field (and its items) after the user edits it. Returns the same object when nothing changed. */
export function withoutField(errors: FormErrors, name: string): FormErrors {
  const key = toDotNotation(name)
  const kept = Object.entries(errors).filter(([k]) => {
    const dotted = toDotNotation(k)
    return dotted !== key && !(name.endsWith("[]") && dotted.startsWith(`${key}.`))
  })
  return kept.length === Object.keys(errors).length ? errors : Object.fromEntries(kept)
}

type Focusable = HTMLElement & { name?: string; disabled?: boolean }

/** Finds the control for an error key (`items.0.name`) inside `root`: by `name` (dot or bracket form), then by `id`. */
export function findField(root: ParentNode | null | undefined, name: string): HTMLElement | null {
  if (!root) return null
  const target = toDotNotation(name)
  const candidates = Array.from(root.querySelectorAll<Focusable>("[name]")).filter(
    (el) => el.getAttribute("type") !== "hidden",
  )
  const named =
    candidates.find((el) => toDotNotation(el.getAttribute("name") ?? "") === target) ??
    // `tags.1` → the `tags[]` control.
    candidates.find((el) => {
      const own = el.getAttribute("name") ?? ""
      return own.endsWith("[]") && target.startsWith(`${toDotNotation(own)}.`)
    })
  if (named) return named
  const byId = Array.from(root.querySelectorAll<HTMLElement>("[id]")).find((el) => el.id === name)
  return byId ?? null
}

/**
 * Asks collapsed containers (a closed accordion item, an inactive tab…) to show
 * `el`, so it can be focused. Containers listen for the `forms:reveal` event.
 */
export function revealField(el: HTMLElement) {
  el.dispatchEvent(new CustomEvent("forms:reveal", { bubbles: true }))
  // Onu's containers listen for their own event name.
  el.dispatchEvent(new CustomEvent("onu:reveal", { bubbles: true }))
}

/** The element to focus for a control: a visually hidden native input hands over to its visible sibling. */
function focusTarget(el: HTMLElement): HTMLElement {
  const hidden =
    el instanceof HTMLInputElement &&
    (el.getAttribute("aria-hidden") === "true" || el.tabIndex < 0 || el.style.display === "none")
  if (!hidden) return el
  return (
    el.parentElement?.querySelector<HTMLElement>("button, [tabindex]:not([tabindex='-1']), input:not([type=hidden])") ??
    el
  )
}

/**
 * Reveals, scrolls to and focuses a control. When a container has to open
 * first (it re-renders), focus follows on the next frames. Returns `true`
 * when focus moved or is scheduled.
 */
export function focusField(el: HTMLElement | null | undefined): boolean {
  if (!el) return false
  revealField(el)
  const target = focusTarget(el)
  const focus = () => {
    target.scrollIntoView?.({ block: "center", behavior: "smooth" })
    target.focus({ preventScroll: true })
  }
  if (!target.closest("[hidden]")) {
    focus()
    return document.activeElement === target
  }
  let tries = 0
  const retry = () => {
    if (!target.isConnected) return
    if (!target.closest("[hidden]")) focus()
    else if (++tries < 10) setTimeout(retry, 16)
  }
  setTimeout(retry, 0)
  return true
}

/** Focuses the first invalid control in `root`, in document order. */
export function focusFirstInvalid(root: HTMLElement | null, errors?: FormErrors | null): boolean {
  if (!root) return false
  const keys = errorEntries(errors).map(([name]) => toDotNotation(name))
  const controls = Array.from(root.querySelectorAll<Focusable>("input, select, textarea, button, [aria-invalid]"))
  const first = controls.find((el) => {
    const type = el.getAttribute("type")
    if (type === "hidden" || type === "submit") return false
    if (el.getAttribute("aria-invalid") === "true") return true
    const name = el.getAttribute("name")
    if (!name) return false
    const dotted = toDotNotation(name)
    return keys.some((key) => key === dotted || (name.endsWith("[]") && key.startsWith(`${dotted}.`)))
  })
  return focusField(first)
}
