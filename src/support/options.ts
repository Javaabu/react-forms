import * as React from "react"
import type { ChoiceOption } from "@javaabu/onu"

import { dataGet, isNil, toFormString, wrap } from "./data"
import { snake } from "./str"

/**
 * Options in the shapes Laravel sends them:
 * - `{ be: "Belgium", nl: "The Netherlands" }`: a key → label array;
 * - `["a", "b"]`: a PHP list, so the values are the indexes `0`, `1` (as in Blade);
 * - `[[10, "Ten"], [5, "Five"]]`: ordered pairs, when key order matters (JS sorts numeric object keys);
 * - `[{ id: 1, name: "Malé" }]`: records (an Eloquent collection), read with `idField` / `nameField`;
 * - `[{ value: "1", label: "Malé" }]`: Onu `ChoiceOption`s.
 */
export type OptionsInput =
  | Record<string, React.ReactNode>
  | ReadonlyArray<string | number>
  | ReadonlyArray<readonly [string | number, React.ReactNode]>
  | ReadonlyArray<ChoiceOption>
  | ReadonlyArray<Record<string, unknown>>
  | Map<string | number, React.ReactNode>

export interface OptionFields {
  /** Record key holding the label. Default `name`. */
  nameField?: string
  /** Record key holding the value. Default `id`. */
  idField?: string
}

function labelText(label: unknown): string {
  if (isNil(label)) return ""
  if (typeof label === "string" || typeof label === "number") return String(label)
  if (typeof label === "boolean") return label ? "1" : ""
  return ""
}

function isChoiceOption(item: Record<string, unknown>) {
  return "value" in item && "label" in item
}

/** Normalizes any `OptionsInput` to Onu `ChoiceOption`s (string values). */
export function normalizeOptions(options: OptionsInput | null | undefined, fields: OptionFields = {}): ChoiceOption[] {
  if (!options) return []
  const nameField = fields.nameField || "name"
  const idField = fields.idField || "id"

  if (options instanceof Map) {
    return [...options.entries()].map(([value, label]) => ({ value: String(value), label: labelText(label) }))
  }

  if (Array.isArray(options)) {
    return options.map((item: unknown, index) => {
      if (Array.isArray(item)) return { value: toFormString(item[0]), label: labelText(item[1]) }
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>
        if (!fields.nameField && !fields.idField && isChoiceOption(record)) return record as unknown as ChoiceOption
        return {
          value: toFormString(dataGet(record, idField)),
          label: labelText(dataGet(record, nameField)),
          data: record,
        }
      }
      return { value: String(index), label: labelText(item) }
    })
  }

  return Object.entries(options).map(([value, label]) => ({ value, label: labelText(label) }))
}

/** Reads `<option value="…">Label</option>` children (Blade's slot) as options. */
export function optionsFromChildren(children: React.ReactNode): ChoiceOption[] {
  const out: ChoiceOption[] = []
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    const props = child.props as { value?: unknown; children?: React.ReactNode; disabled?: boolean; label?: string }
    if (child.type === "option") {
      const label = props.label ?? React.Children.toArray(props.children).join("")
      out.push({ value: toFormString(props.value ?? label), label, disabled: props.disabled })
    } else if (child.type === "optgroup") {
      for (const option of optionsFromChildren(props.children)) out.push({ ...option, group: props.label })
    } else if (child.type === React.Fragment) {
      out.push(...optionsFromChildren(props.children))
    }
  })
  return out
}

/**
 * The selected value(s) from a bound value, like `Select`'s constructor: a model
 * becomes its key (`idField` or `id`), a collection its keys, an enum-like
 * `{ value }` object its value.
 */
export function toSelectedValues(value: unknown, idField?: string): string[] {
  return wrap(value as unknown).flatMap((item) => {
    if (isNil(item) || item === "") return []
    if (typeof item === "object" && !(item instanceof Date)) {
      const record = item as Record<string, unknown>
      const key = idField ? record[idField] : "id" in record ? record.id : "value" in record ? record.value : undefined
      return isNil(key) ? [] : [toFormString(key)]
    }
    return [toFormString(item)]
  })
}

/**
 * The value of a relation select (`relation`): the foreign key of a `BelongsTo`
 * (`country` → `country_id`), or the keys of the loaded related models.
 */
export function relationValue(target: unknown, path: string, multiple: boolean, idField?: string): unknown {
  if (isNil(target)) return undefined
  const segments = path.split(".")
  const last = segments.pop()!
  const parent = segments.length ? dataGet(target, segments.join(".")) : target
  if (!multiple) {
    const foreignKey = dataGet(parent, `${snake(last)}_id`)
    if (!isNil(foreignKey)) return foreignKey
  }
  const related = dataGet(parent, last)
  return isNil(related) ? undefined : toSelectedValues(related, idField)
}
