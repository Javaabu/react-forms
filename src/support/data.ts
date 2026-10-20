/** Anything a field can be bound to: a model, a plain object, an array or a `Map`. */
export type Bindable = Record<string, unknown> | unknown[] | Map<string, unknown>

/** True for `null` and `undefined`. */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

function child(target: unknown, key: string): unknown {
  if (isNil(target)) return undefined
  if (target instanceof Map) return target.get(key)
  if (typeof target === "object") return (target as Record<string, unknown>)[key]
  return undefined
}

/**
 * `data_get`: reads a dot-notation path (`address.city`, `items.0.name`) from
 * objects, arrays and maps. `*` collects the value from every item.
 */
export function dataGet(target: unknown, path: string | number | null | undefined, fallback?: unknown): unknown {
  if (path === null || path === undefined || path === "") return target
  const segments = String(path).split(".")
  let current: unknown = target

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!
    if (segment === "*") {
      const items =
        current instanceof Map
          ? [...current.values()]
          : Array.isArray(current)
            ? current
            : current && typeof current === "object"
              ? Object.values(current)
              : null
      if (!items) return fallback
      const rest = segments.slice(i + 1).join(".")
      return items.map((item) => dataGet(item, rest))
    }
    current = child(current, segment)
    if (current === undefined) return fallback
  }

  return current
}

/** True when `path` exists on `target`, even when its value is `null`. */
export function dataHas(target: unknown, path: string): boolean {
  const segments = path.split(".")
  let current: unknown = target
  for (const segment of segments) {
    if (isNil(current) || typeof current !== "object") return false
    if (current instanceof Map) {
      if (!current.has(segment)) return false
      current = current.get(segment)
    } else {
      if (!(segment in (current as Record<string, unknown>))) return false
      current = (current as Record<string, unknown>)[segment]
    }
  }
  return true
}

/** `Arr::wrap`: `null` → `[]`, an array stays as it is, anything else becomes `[value]`. */
export function wrap<T>(value: T | T[] | null | undefined): T[] {
  if (isNil(value)) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * The string a value takes in an HTML attribute, the way Blade's `{{ $value }}`
 * prints it: `true` → `"1"`, `false` / `null` → `""`.
 */
export function toFormString(value: unknown): string {
  if (isNil(value) || value === false) return ""
  if (value === true) return "1"
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

/** PHP's loose `in_array`: compares values as strings, so `1` matches `"1"`. */
export function looseIncludes(haystack: readonly unknown[], needle: unknown): boolean {
  const n = toFormString(needle)
  return haystack.some((item) => toFormString(item) === n)
}

/** PHP's `empty()`: `null`, `""`, `"0"`, `0`, `false` and `[]` are empty. */
export function isEmpty(value: unknown): boolean {
  return (
    isNil(value) ||
    value === "" ||
    value === "0" ||
    value === 0 ||
    value === false ||
    (Array.isArray(value) && value.length === 0)
  )
}
