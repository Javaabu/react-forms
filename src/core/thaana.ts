import type * as React from "react"

/**
 * Typing Thaana from a Latin keyboard, for adapters whose inputs don't do it
 * themselves. Phonetic layout from JTK (Javascript Thaana Keyboard) 4.2.2,
 * Copyright (c) 2014 Jawish Hameed, MIT licence: https://github.com/jawish/jtk
 */

const FROM = "qwertyuiop[]\\asdfghjkl;'zxcvbnm,./QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>?()"
const PHONETIC = "ްއެރތޔުިޮޕ][\\ަސދފގހޖކލ؛'ޒ×ޗވބނމ،./ޤޢޭޜޓޠޫީޯ÷}{|ާށޑﷲޣޙޛޚޅ:\"ޡޘޝޥޞޏޟ><؟)("

/** Latin key → Thaana character (phonetic layout). */
export const THAANA_KEYMAP: Readonly<Record<string, string>> = (() => {
  const keys = Array.from(FROM)
  const chars = Array.from(PHONETIC)
  const map: Record<string, string> = {}
  keys.forEach((key, i) => {
    if (key !== chars[i]) map[key] = chars[i]!
  })
  return Object.freeze(map)
})()

/** Converts Latin text typed on the phonetic layout to Thaana: `"dhivehi"` keys → `"ދިވެހި"`. */
export function toThaana(text: string): string {
  return Array.from(text, (char) => THAANA_KEYMAP[char] ?? char).join("")
}

type TextControl = HTMLInputElement | HTMLTextAreaElement

/** Sets a control's value so React's `onChange` sees it, as if the user typed it. */
function setNativeValue(el: TextControl, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value)
  el.dispatchEvent(new Event("input", { bubbles: true }))
}

/**
 * A `keydown` handler that types the Thaana character for a Latin key, at the
 * caret, and fires `onChange` as typing would. Spread it on inputs with `thaana`:
 * `<input onKeyDown={thaana ? thaanaKeyDown : undefined} />`.
 */
export function thaanaKeyDown(event: React.KeyboardEvent<TextControl>): void {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return
  const char = THAANA_KEYMAP[event.key]
  if (!char) return
  const el = event.currentTarget
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? start
  event.preventDefault()
  setNativeValue(el, el.value.slice(0, start) + char + el.value.slice(end))
  const caret = start + char.length
  el.setSelectionRange?.(caret, caret)
}
