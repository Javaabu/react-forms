"use client"

import * as React from "react"
import {
  Checkbox as OnuCheckbox,
  RequiredMarker,
  useFormFieldControl,
  type CheckboxProps as OnuCheckboxProps,
} from "@javaabu/onu"

import { getBoundValue, useBindTarget, useOldInput, type ModelProp } from "../context/binding"
import { usePublishField } from "../context/registry"
import { isEmpty, isNil, looseIncludes, toFormString, wrap } from "../support/data"
import { nameToId } from "../support/str"
import { FieldWrapper, splitFieldProps, useFieldNames, type FieldProps } from "./field"
import { useSyncedState } from "../support/use-synced-state"

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

type OnuControlProps = Omit<
  OnuCheckboxProps,
  "name" | "id" | "value" | "defaultChecked" | "checked" | "required" | "disabled" | "label" | "children"
>

export interface CheckboxProps extends Omit<FieldProps, "default">, OnuControlProps {
  /** Value submitted when checked. Default `1`. */
  value?: string | number | boolean
  /** Checked when there is no old input and the bound value is `null`. Default `false`. */
  default?: boolean
  /** Controlled checked state. */
  checked?: boolean
  /** Label beside the box (Blade's default slot). With `inline`, `label` goes in the label column instead. */
  children?: React.ReactNode
}

/** `<x-forms::checkbox>`: a checkbox with model binding (booleans or arrays of values), old input and errors. */
export function Checkbox(props: CheckboxProps) {
  const { field, rest } = splitFieldProps(props)
  const { value = 1, checked, onCheckedChange, children, ...checkboxProps } = rest
  const names = useFieldNames(field)
  const id = choiceId(field.name, value, field.id)
  const initial = useInitialChecked(field.name, field.model, value, field.default)
  const [current, setCurrent] = useSyncedState(initial)
  const isChecked = checked ?? current

  usePublishField({
    id,
    name: field.name,
    kind: "checkbox",
    value: toFormString(value),
    checked: isChecked,
    disabled: field.disabled,
  })

  const boxLabel = field.inline ? children : (children ?? names.label)

  return (
    <FieldWrapper {...field} id={id} label={field.inline ? names.label : undefined}>
      <OnuCheckbox
        {...checkboxProps}
        key={checked === undefined ? String(initial) : undefined}
        id={id}
        name={field.name}
        value={toFormString(value)}
        required={field.required || undefined}
        disabled={field.disabled || undefined}
        {...(checked === undefined ? { defaultChecked: initial } : { checked })}
        onCheckedChange={(state) => {
          setCurrent(state === true)
          onCheckedChange?.(state)
        }}
        label={
          boxLabel ? (
            <>
              {boxLabel}
              {field.required && !field.inline ? <RequiredMarker /> : null}
            </>
          ) : undefined
        }
      />
    </FieldWrapper>
  )
}

export interface RadioProps
  extends
    Omit<FieldProps, "default">,
    Omit<
      React.ComponentProps<"input">,
      "name" | "id" | "value" | "type" | "defaultChecked" | "required" | "disabled" | "children"
    > {
  /** Value submitted when selected. Default `1`. */
  value?: string | number | boolean
  /** Selected when there is no old input and the bound value is `null`. Default `false`. */
  default?: boolean
  /** Label beside the radio (Blade's default slot). */
  children?: React.ReactNode
}

function RadioControl({
  label,
  marker,
  ...props
}: React.ComponentProps<"input"> & { label?: React.ReactNode; marker?: boolean }) {
  const control = useFormFieldControl(props)
  return (
    <div data-slot="radio" className="gap-2 flex items-center">
      <input
        {...control}
        type="radio"
        className="size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:outline aria-invalid:outline-destructive"
      />
      {label ? (
        <label htmlFor={control.id} className="text-sm leading-none cursor-pointer select-none">
          {label}
          {marker ? <RequiredMarker /> : null}
        </label>
      ) : null}
    </div>
  )
}

/**
 * `<x-forms::radio>`: one radio button. Radios with the same `name` form a group,
 * as in plain HTML; give each a different `value`.
 */
export function Radio(props: RadioProps) {
  const { field, rest } = splitFieldProps(props)
  const { value = 1, checked, onChange, children, ...inputProps } = rest
  const names = useFieldNames(field)
  const id = choiceId(`${field.name}[]`, value, field.id)
  const initial = useInitialChecked(field.name, field.model, value, field.default, true)
  const [current, setCurrent] = useSyncedState(initial)

  // A radio only reports its own change; listen to the group to see it being unchecked.
  React.useEffect(() => {
    if (typeof document === "undefined") return
    const sync = (event: Event) => {
      const target = event.target as HTMLInputElement
      if (target.type === "radio" && target.name === field.name && target.id !== id) setCurrent(false)
    }
    document.addEventListener("change", sync, true)
    return () => document.removeEventListener("change", sync, true)
  }, [field.name, id, setCurrent])

  usePublishField({
    id,
    name: field.name,
    kind: "radio",
    value: toFormString(value),
    checked: checked ?? current,
    disabled: field.disabled,
  })

  return (
    <FieldWrapper {...field} id={id} label={field.inline ? names.label : undefined}>
      <RadioControl
        {...inputProps}
        key={checked === undefined ? String(initial) : undefined}
        id={id}
        name={field.name}
        value={toFormString(value)}
        required={field.required || undefined}
        marker={field.required && !field.inline}
        disabled={field.disabled || undefined}
        {...(checked === undefined ? { defaultChecked: initial } : { checked })}
        onChange={(event) => {
          setCurrent(event.target.checked)
          onChange?.(event)
        }}
        label={field.inline ? children : (children ?? names.label)}
      />
    </FieldWrapper>
  )
}
