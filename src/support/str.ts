/**
 * Ports of the Laravel `Str` helpers that javaabu/forms uses to derive labels,
 * ids and slot names from field names. They follow Laravel's behaviour so a
 * field gets the same label and id in React as it does in Blade.
 */

/** `Str::before`: the part of `subject` before the first `search`. */
export function before(subject: string, search: string): string {
  if (!search) return subject
  const index = subject.indexOf(search)
  return index === -1 ? subject : subject.slice(0, index)
}

/** `Str::studly`: `foo_bar-baz qux` → `FooBarBazQux`. */
export function studly(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
}

/** `Str::camel`: `foo_bar` → `fooBar`. */
export function camel(value: string): string {
  const s = studly(value)
  return s.charAt(0).toLowerCase() + s.slice(1)
}

/** `Str::snake`: `fooBar` → `foo_bar`. */
export function snake(value: string, delimiter = "_"): string {
  if (/^[a-z0-9_]*$/.test(value) && delimiter === "_") return value
  const words = value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
  return words.replace(/(.)(?=\p{Lu})/gu, `$1${delimiter}`).toLowerCase()
}

/** `Str::kebab`: `fooBar` → `foo-bar`. */
export function kebab(value: string): string {
  return snake(value, "-")
}

/** `Str::title`: every word capitalised, the rest lower case. */
export function title(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|[^\p{L}\p{N}'’])(\p{L})/gu, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
}

/** `foo[bar][]` → `foo.bar`, the key format Laravel uses for old input, errors and `data_get`. */
export function bracketsToDots(name: string): string {
  return before(name, "[]").replace(/\[/g, ".").replace(/\]/g, "")
}

/**
 * The id javaabu/forms generates from a field name: `address[city]` → `address-city`,
 * `tags[]` → `tags`.
 */
export function nameToId(name: string): string {
  return before(name, "[]").replace(/\[/g, "-").replace(/\]/g, "")
}

/**
 * The label javaabu/forms generates from a field name before translating it:
 * `company_name` → `Company Name`, `userId` → `User Id`, `address[city]` → `Address City`.
 */
export function nameToLabel(name: string): string {
  const base = before(name, "[]").replace(/\[/g, "_").replace(/\]/g, "")
  return title(snake(camel(base)).replace(/_/g, " "))
}

/**
 * The slot name Blade derives from a tab or accordion item name (`application-requirements`
 * → `applicationRequirements`). Used to match `TabsPane` / item content by name.
 */
export function slotName(name: string): string {
  return camel(snake(camel(name)).replace(/_/g, " "))
}
