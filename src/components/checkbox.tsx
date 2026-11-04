"use client"

import * as React from "react"
import { getBoundValue, useBindTarget, useOldInput, type ModelProp } from "../core/binding"
import { useFormValues } from "../core/form-context"
import { useUi } from "../core/provider"
import { usePublishField } from "../core/registry"
import { isEmpty, isNil, looseIncludes, toFormString, wrap } from "../support/data"
import { before, nameToId } from "../support/str"
import { splitFieldProps, useField, useFieldState, useLabelWithMarker, type FieldProps } from "./field"

/**
 * The checked state of a checkbox or radio, in javaabu/forms order:
 * 1. old input: checked when it contains `value` (missing old input means unchecked);
 * 2. bound value: an array is checked when it contains `value`, a scalar by its truthiness
 *    (for radios: when it equals `value`);
 * 3. `default`, when the bound value is `null`.
 */
export function useInitialChecked(
  name: string,
  model: ModelProp,
  value: unknown,
  fallback: unknown,
  compareScalar = false,
): boolean {
  const target = useBindTarget(model)
  const old = useOldInput()

  if (old.has) {
    const oldValue = old.get(name)
    return !isEmpty(oldValue) && looseIncludes(wrap(oldValue as unknown), value)
  }

  const bound = getBoundValue(target, name)
  if (Array.isArray(bound)) return looseIncludes(bound, value)
  if (isNil(bound)) return !isEmpty(fallback)
  // A radio is selected when the bound value is its value (Blade would check every radio of a group).
  return compareScalar ? looseIncludes([bound], value) : !isEmpty(bound)
}

/** Ids of grouped checkboxes (`channels[]`) get the value appended, so each one stays unique. */
export function choiceId(name: string, value: unknown, id?: string) {
  if (id) return id
  const base = nameToId(name)
  return name.endsWith("[]") ? `${base}-${toFormString(value)}` : base
}

export interface CheckboxProps extends Omit<FieldProps, "default"> {
  /** Value submitted when checked. Default `1`. */
  value?: string | number | boolean
  /** Checked when there is no old input and the bound value is `null`. Default `false`. */
  default?: boolean
  /** Controlled checked state. */
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Label beside the box (Blade's default slot). With `inline`, `label` goes in the label column instead. */
  children?: React.ReactNode
  className?: string
}

/**
 * Checkboxes and radios in an Inertia `useForm` store: a group (`channels[]`) holds an
 * array of the checked values, radios the selected value, a single checkbox its value or `false`.
 */
function useChoiceStore(name: string, value: string, kind: "checkbox" | "radio", initial: boolean) {
  const store = useFormValues()
  const group = kind === "checkbox" && name.endsWith("[]")
  const key = group ? before(name, "[]") : name

  React.useEffect(() => {
    if (!store) return
    if (group) {
      store.update(key, (current) => {
        const list = wrap(current as unknown).map(toFormString)
        return initial && !list.includes(value) ? [...list, value] : list
      })
    } else if (kind === "radio") {
      if (initial || !store.has(key)) store.update(key, (current) => (initial ? value : (current ?? "")))
    } else if (!store.has(key)) {
      store.set(key, initial ? value : false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, key])

  if (!store) return null
  const raw = store.get(key)
  const checked = group
    ? looseIncludes(wrap(raw as unknown), value)
    : kind === "radio"
      ? toFormString(raw) === value
      : !isEmpty(raw)
  const set = (on: boolean) => {
    if (group) {
      store.update(key, (current) => {
        const list = wrap(current as unknown)
          .map(toFormString)
          .filter((v) => v !== value)
        return on ? [...list, value] : list
      })
    } else if (kind === "radio") {
      if (on) store.set(key, value)
    } else store.set(key, on ? value : false)
  }
  return { checked, set }
}

/** `<x-forms::checkbox>`: a checkbox with model binding (booleans or arrays of values), old input and errors. */
export function Checkbox(props: CheckboxProps) {
  const ui = useUi()
  const { field, rest } = splitFieldProps(props)
  const { value = 1, checked, onCheckedChange, children, className } = rest
  const submitted = toFormString(value)
  const id = choiceId(field.name, value, field.id)
  const f = useField({ ...field, controlId: id, labelInControl: !field.inline })
  const initial = useInitialChecked(field.name, field.model, value, field.default)
  const store = useChoiceStore(field.name, submitted, "checkbox", initial)
  const [own, setOwn] = useFieldState(field.name, initial, { controlled: checked, key: String(initial), store: false })
  const current = checked ?? store?.checked ?? own
  const setCurrent = (on: boolean) => {
    setOwn(on)
    store?.set(on)
  }

  usePublishField({
    id,
    name: field.name,
    kind: "checkbox",
    value: submitted,
    checked: current,
    disabled: f.disabled,
    label: f.labelText,
  })

  const boxLabel = useLabelWithMarker(field.inline ? children : (children ?? f.label), field.required && !field.inline)

  return f.wrap(
    <ui.Checkbox
      {...f.control}
      className={className}
      value={submitted}
      checked={current}
      label={boxLabel || undefined}
      onCheckedChange={(state) => {
        setCurrent(state)
        onCheckedChange?.(state)
      }}
    />,
  )
}

export interface RadioProps extends Omit<FieldProps, "default"> {
  /** Value submitted when selected. Default `1`. */
  value?: string | number | boolean
  /** Selected when there is no old input and the bound value is `null`. Default `false`. */
  default?: boolean
  /** Controlled selected state. */
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Label beside the radio (Blade's default slot). */
  children?: React.ReactNode
  className?: string
}

/**
 * `<x-forms::radio>`: one radio button. Radios with the same `name` form a group,
 * as in plain HTML; give each a different `value`.
 */
export function Radio(props: RadioProps) {
  const ui = useUi()
  const { field, rest } = splitFieldProps(props)
  const { value = 1, checked, onCheckedChange, children, className } = rest
  const submitted = toFormString(value)
  const id = choiceId(`${field.name}[]`, value, field.id)
  const f = useField({ ...field, controlId: id, labelInControl: !field.inline })
  const initial = useInitialChecked(field.name, field.model, value, field.default, true)
  const store = useChoiceStore(field.name, submitted, "radio", initial)
  const [own, setOwn] = useFieldState(field.name, initial, { controlled: checked, key: String(initial), store: false })
  const current = checked ?? store?.checked ?? own
  const setCurrent = (on: boolean) => {
    setOwn(on)
    store?.set(on)
  }

  // A radio only reports its own change; listen to the group to see it being unchecked. `click` (also
  // fired for arrow keys) in the capture phase runs before React's handler, so both updates render together.
  React.useEffect(() => {
    if (typeof document === "undefined") return
    const sync = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLInputElement) || target.type !== "radio") return
      if (target.name === field.name && target.id !== id && target.checked && !target.disabled) setCurrent(false)
    }
    document.addEventListener("click", sync, true)
    document.addEventListener("change", sync, true)
    return () => {
      document.removeEventListener("click", sync, true)
      document.removeEventListener("change", sync, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.name, id])

  usePublishField({
    id,
    name: field.name,
    kind: "radio",
    value: submitted,
    checked: current,
    disabled: f.disabled,
    label: f.labelText,
  })

  const radioLabel = useLabelWithMarker(
    field.inline ? children : (children ?? f.label),
    field.required && !field.inline,
  )

  return f.wrap(
    <ui.Radio
      {...f.control}
      className={className}
      value={submitted}
      checked={current}
      label={radioLabel || undefined}
      onCheckedChange={(state) => {
        if (state) setCurrent(true)
        onCheckedChange?.(state)
      }}
    />,
  )
}
