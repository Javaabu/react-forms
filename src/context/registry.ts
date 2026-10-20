"use client"

import * as React from "react"

import { before } from "../support/str"

/**
 * The field registry stands in for the DOM selectors js-utilities used
 * (`data-enable-elem="#type"`, `data-select-child="#state"`, `data-fallback="#city-name"`).
 * Every field publishes its id, name and current value here, so a component
 * can follow another field by `#id` or by name, wherever it is on the page.
 */

export type FieldKind = "value" | "checkbox" | "radio"

export interface FieldEntry {
  id?: string
  name?: string
  kind: FieldKind
  /** The field's value; for checkboxes and radios, the value they submit when checked. */
  value: unknown
  checked?: boolean
  disabled?: boolean
}

/** What a watcher sees: the effective value and, for a single checkbox, whether it is checked. */
export interface WatchedField {
  value: unknown
  checked: boolean
  /** True when a registered field (or a DOM element) matched the selector. */
  found: boolean
}

type Listener = () => void

const entries = new Map<symbol, FieldEntry>()
/** Links set by one field about another, e.g. a parent's `child="#state"`: `child:#state` → parent selector. */
const links = new Map<string, Map<symbol, string>>()
/** State a field publishes for another, e.g. a select's fallback input: `fallback:#city-name` → active. */
const flags = new Map<string, Map<symbol, unknown>>()
const listeners = new Set<Listener>()
let version = 0

function emit() {
  version++
  for (const listener of listeners) listener()
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getVersion = () => version
const noopSubscribe = () => () => {}

function baseName(name: string) {
  return before(name, "[]")
}

/** Parses `#id`, `[name="x"]`, `[name=x]` or a bare field name. */
export function parseSelector(selector: string): { id?: string; name?: string } {
  const s = selector.trim()
  if (s.startsWith("#")) return { id: s.slice(1) }
  const attr = /^\[name=["']?([^"'\]]+)["']?\]$/.exec(s)
  if (attr) return { name: attr[1] }
  return { name: s }
}

function lookup(selector: string): WatchedField {
  const { id, name } = parseSelector(selector)
  const all = [...entries.values()]

  if (id) {
    const entry = all.find((e) => e.id === id)
    if (!entry) return { value: undefined, checked: false, found: false }
    if (entry.kind === "value") return { value: entry.value, checked: !!entry.value, found: true }
    if (entry.kind === "radio") {
      // `$('#yes').val()` is the radio's value; `.is(':checked')` its state.
      return { value: entry.checked ? entry.value : undefined, checked: !!entry.checked, found: true }
    }
    return { value: entry.checked ? entry.value : undefined, checked: !!entry.checked, found: true }
  }

  const matches = all.filter((e) => e.name !== undefined && (e.name === name || baseName(e.name) === name))
  if (!matches.length) return { value: undefined, checked: false, found: false }

  const first = matches[0]!
  if (first.kind === "value") return { value: first.value, checked: !!first.value, found: true }
  if (first.kind === "radio") {
    const checked = matches.find((e) => e.checked)
    return { value: checked?.value, checked: !!checked, found: true }
  }
  // Checkbox group (`channels[]`) or a single checkbox.
  const checked = matches.filter((e) => e.checked)
  const isGroup = first.name?.endsWith("[]") || matches.length > 1
  return {
    value: isGroup ? checked.map((e) => e.value) : checked[0]?.value,
    checked: checked.length > 0,
    found: true,
  }
}

/** Reads a non-registered element from the DOM, as jQuery would. */
function lookupDom(selector: string): WatchedField {
  if (typeof document === "undefined") return { value: undefined, checked: false, found: false }
  let elements: Element[]
  try {
    const { id, name } = parseSelector(selector)
    elements = id
      ? [document.getElementById(id)].filter((el): el is HTMLElement => !!el)
      : Array.from(document.getElementsByName(name ?? ""))
  } catch {
    return { value: undefined, checked: false, found: false }
  }
  const inputs = elements.filter(
    (el): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
      el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement,
  )
  if (!inputs.length) return { value: undefined, checked: false, found: false }
  const first = inputs[0]!
  if (first instanceof HTMLInputElement && (first.type === "checkbox" || first.type === "radio")) {
    const checked = inputs.filter((el) => (el as HTMLInputElement).checked)
    const value = first.type === "checkbox" && inputs.length > 1 ? checked.map((el) => el.value) : checked[0]?.value
    return { value, checked: checked.length > 0, found: true }
  }
  if (first instanceof HTMLSelectElement && first.multiple) {
    return { value: Array.from(first.selectedOptions).map((o) => o.value), checked: false, found: true }
  }
  return { value: first.value, checked: !!first.value, found: true }
}

export const registry = {
  subscribe,
  getVersion,
  lookup,
  set(key: symbol, entry: FieldEntry) {
    entries.set(key, entry)
    emit()
  },
  delete(key: symbol) {
    if (entries.delete(key)) emit()
  },
  link(kind: string, target: string, key: symbol, value: string) {
    const k = `${kind}:${target}`
    let map = links.get(k)
    if (!map) links.set(k, (map = new Map()))
    map.set(key, value)
    emit()
  },
  unlink(kind: string, target: string, key: symbol) {
    if (links.get(`${kind}:${target}`)?.delete(key)) emit()
  },
  getLink(kind: string, target: string): string | undefined {
    const map = links.get(`${kind}:${target}`)
    return map ? [...map.values()].at(-1) : undefined
  },
  flag(kind: string, target: string, key: symbol, value: unknown) {
    const k = `${kind}:${target}`
    let map = flags.get(k)
    if (!map) flags.set(k, (map = new Map()))
    map.set(key, value)
    emit()
  },
  unflag(kind: string, target: string, key: symbol) {
    if (flags.get(`${kind}:${target}`)?.delete(key)) emit()
  },
  getFlag(kind: string, target: string): unknown {
    const map = flags.get(`${kind}:${target}`)
    return map && map.size ? [...map.values()].at(-1) : undefined
  },
}

/** Publishes a field to the registry while it is mounted. */
export function usePublishField(entry: FieldEntry | null) {
  const key = React.useMemo(() => Symbol("field"), [])
  const { id, name, kind, value, checked, disabled } = entry ?? { kind: "value" as const, value: undefined }
  const active = entry !== null
  const serialized = Array.isArray(value) ? JSON.stringify(value) : value

  React.useEffect(() => {
    if (!active) return
    registry.set(key, { id, name, kind, value, checked, disabled })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active, id, name, kind, serialized, checked, disabled])

  React.useEffect(() => () => registry.delete(key), [key])
}

/** Subscribes to every change in the registry and in the DOM's form controls. */
function useRegistryVersion(withDom: boolean) {
  const [domVersion, bump] = React.useReducer((n: number) => n + 1, 0)

  React.useEffect(() => {
    if (!withDom || typeof document === "undefined") return
    const onChange = () => bump()
    document.addEventListener("change", onChange, true)
    document.addEventListener("input", onChange, true)
    return () => {
      document.removeEventListener("change", onChange, true)
      document.removeEventListener("input", onChange, true)
    }
  }, [withDom])

  const v = React.useSyncExternalStore(subscribe, getVersion, getVersion)
  return `${v}:${domVersion}`
}

/**
 * Follows another field by selector (`#id`, `[name=x]` or a name): registered
 * Onu-based fields first, then plain DOM inputs (for markup you wrote yourself).
 */
export function useWatchField(selector: string | null | undefined): WatchedField {
  const version = useRegistryVersion(!!selector)
  // Re-read the DOM after mount too: the element may render after this component.
  const mounted = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )

  return React.useMemo(() => {
    if (!selector) return { value: undefined, checked: false, found: false }
    const found = lookup(selector)
    if (found.found || !mounted) return found
    return lookupDom(selector)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, version, mounted])
}

/** Registers a link from this component to another field (`child`, `ajaxChild`, `fallback`). */
export function useLink(kind: string, target: string | null | undefined, value: string | null | undefined) {
  const key = React.useMemo(() => Symbol(kind), [kind])
  React.useEffect(() => {
    if (!target || !value) return
    const t = normalizeTarget(target)
    registry.link(kind, t, key, value)
    return () => registry.unlink(kind, t, key)
  }, [kind, target, value, key])
}

/** Reads the link another field set about this one (by its id or name). */
export function useLinkedFrom(kind: string, id: string | undefined, name: string | undefined): string | undefined {
  React.useSyncExternalStore(subscribe, getVersion, getVersion)
  return (
    (id ? registry.getLink(kind, `#${id}`) : undefined) ?? (name ? registry.getLink(kind, baseName(name)) : undefined)
  )
}

/** Publishes a flag about another field while mounted. */
export function useFlag(kind: string, target: string | null | undefined, value: unknown) {
  const key = React.useMemo(() => Symbol(kind), [kind])
  React.useEffect(() => {
    if (!target) return
    const t = normalizeTarget(target)
    registry.flag(kind, t, key, value)
    return () => registry.unflag(kind, t, key)
  }, [kind, target, value, key])
}

/** Reads a flag another field published about this one (by its id or name). */
export function useFlagFor(kind: string, id: string | undefined, name: string | undefined): unknown {
  React.useSyncExternalStore(subscribe, getVersion, getVersion)
  const byId = id ? registry.getFlag(kind, `#${id}`) : undefined
  return byId !== undefined ? byId : name ? registry.getFlag(kind, baseName(name)) : undefined
}

/** `#id` stays as it is; `[name=x]` and bare names become the base name. */
function normalizeTarget(selector: string) {
  const { id, name } = parseSelector(selector)
  return id ? `#${id}` : baseName(name ?? "")
}
