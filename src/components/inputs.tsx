"use client"

import * as React from "react"

import { useFieldValue } from "../core/binding"
import { useUi } from "../core/provider"
import { useFlagFor, usePublishField } from "../core/registry"
import { isNil, toFormString } from "../support/data"
import { nameToId } from "../support/str"
import { splitFieldProps, useField, useFieldState, type FieldProps, type PlaceholderProps } from "./field"

type NativeInputProps = Omit<
  React.ComponentProps<"input">,
  | "name"
  | "id"
  | "type"
  | "value"
  | "defaultValue"
  | "placeholder"
  | "required"
  | "disabled"
  | "size"
  | "children"
  | "prefix"
>

export interface InputProps extends FieldProps, PlaceholderProps, NativeInputProps {
  /** HTML input type. `number` and `hidden` render `Number` and `Hidden`. */
  type?: string
  /** Controlled value. Without it the field starts from old input / the model / `default`. */
  value?: string | number | null
  /** Content before the input (Blade's `prepend` slot). */
  prepend?: React.ReactNode
  /** Content after the input (Blade's `append` slot). */
  append?: React.ReactNode
  /** Type Thaana from a Latin keyboard. Use on free-text fields that may hold Dhivehi. */
  thaana?: boolean
  /** Show a Thaana / Latin toggle when `thaana` is on. */
  thaanaToggle?: boolean
}

/**
 * When a `Select2` names this field as its `fallback`, the field is only
 * enabled and shown while the select has no options.
 */
export function useFallback(id: string | undefined, name: string) {
  const flag = useFlagFor("fallback", id, name) as { active: boolean } | undefined
  return flag ? { hidden: !flag.active, disabled: !flag.active } : null
}

/**
 * `<x-forms::input>`: a labelled input with model binding, old input and
 * validation errors. The `type` picks the control; prefer the typed components
 * (`Text`, `Email`, `Number`, …).
 */
export function Input(props: InputProps) {
  switch (props.type) {
    case "number":
      return <NumberField {...(props as NumberProps)} />
    case "hidden":
      return <Hidden {...(props as HiddenProps)} />
    default:
      return <TextLikeField {...props} />
  }
}

const NO_THAANA = new Set(["email", "password", "url", "tel", "number"])

function TextLikeField(props: InputProps) {
  const ui = useUi()
  const { field, rest } = splitFieldProps(props)
  const {
    type = "text",
    value,
    placeholder,
    showPlaceholder,
    prepend,
    append,
    thaana,
    thaanaToggle,
    onChange,
    ...inputProps
  } = rest
  const fallback = useFallback(field.id || nameToId(field.name) || undefined, field.name)
  const f = useField({ ...field, placeholder, showPlaceholder, disabled: field.disabled || fallback?.disabled })
  const fieldValue = useFieldValue(field.name, field.model, field.default)
  // Like Blade, password fields never echo a value back.
  const initial = type === "password" ? "" : toFormString(fieldValue)
  const [current, setCurrent] = useFieldState(field.name, initial, {
    controlled: value === undefined ? undefined : toFormString(value),
  })

  usePublishField({
    id: f.id,
    name: field.name,
    kind: "value",
    value: current,
    disabled: f.disabled,
    label: f.labelText,
  })

  const ltr = NO_THAANA.has(type)
  const input = (
    <ui.Input
      {...inputProps}
      {...f.control}
      type={type}
      dir={inputProps.dir ?? (ltr ? "ltr" : undefined)}
      inputMode={inputProps.inputMode ?? (type === "tel" ? "tel" : undefined)}
      autoComplete={inputProps.autoComplete ?? (type === "tel" ? "tel" : undefined)}
      placeholder={f.placeholder}
      prepend={prepend}
      append={append}
      thaana={ltr ? undefined : thaana}
      thaanaToggle={ltr ? undefined : thaanaToggle}
      value={current}
      onChange={(event) => {
        setCurrent(event.target.value)
        onChange?.(event)
      }}
      onBlur={(event) => {
        // js-utilities' `urlInput`: add the scheme when it is missing.
        if (type === "url" && current && !/^[a-z][a-z\d+.-]*:/i.test(current)) setCurrent(`https://${current}`)
        inputProps.onBlur?.(event)
      }}
    />
  )

  const wrapped = f.wrap(input)
  return fallback ? <div hidden={fallback.hidden}>{wrapped}</div> : wrapped
}

/** `<x-forms::text>`. */
export function Text(props: Omit<InputProps, "type">) {
  return <TextLikeField {...props} type="text" />
}

/** `<x-forms::email>`: always left-to-right, no Thaana keyboard. */
export function Email(props: Omit<InputProps, "type" | "thaana" | "thaanaToggle">) {
  return <TextLikeField {...props} type="email" />
}

/** `<x-forms::password>`: never pre-filled. */
export function Password(props: Omit<InputProps, "type" | "thaana" | "thaanaToggle" | "default">) {
  return <TextLikeField {...props} type="password" />
}

/** `<x-forms::url>`: adds `https://` when it is missing, like js-utilities' `urlInput`. */
export function Url(props: Omit<InputProps, "type" | "thaana" | "thaanaToggle">) {
  return <TextLikeField {...props} type="url" />
}

/** `<x-forms::tel>`: a left-to-right telephone input. The value is submitted as typed. */
export function Tel(props: Omit<InputProps, "type" | "thaana" | "thaanaToggle">) {
  return <TextLikeField {...props} type="tel" />
}

export interface NumberProps extends FieldProps, PlaceholderProps {
  /** Controlled value. */
  value?: number | string | null
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  /** Most decimals. Default: as many as typed. */
  decimals?: number
  prepend?: React.ReactNode
  append?: React.ReactNode
  className?: string
}

function toNumber(value: unknown): number | null {
  if (isNil(value) || value === "") return null
  const n = typeof value === "number" ? value : globalThis.Number(value)
  return globalThis.Number.isFinite(n) ? n : null
}

function NumberField(props: NumberProps) {
  const ui = useUi()
  const { field, rest } = splitFieldProps(props)
  const { value, placeholder, showPlaceholder, prepend, append, onValueChange, ...numberProps } = rest
  const f = useField({ ...field, placeholder, showPlaceholder })
  const initial = toNumber(useFieldValue(field.name, field.model, field.default))
  const [current, setCurrent] = useFieldState(field.name, initial, {
    controlled: value === undefined ? undefined : toNumber(value),
    fromStore: toNumber,
  })

  usePublishField({
    id: f.id,
    name: field.name,
    kind: "value",
    value: current,
    disabled: f.disabled,
    label: f.labelText,
  })

  return f.wrap(
    <ui.Number
      {...numberProps}
      {...f.control}
      placeholder={f.placeholder}
      prepend={prepend}
      append={append}
      value={current}
      onValueChange={(n) => {
        setCurrent(n)
        onValueChange?.(n)
      }}
    />,
  )
}

/** `<x-forms::number>`: a number field that submits the raw number. */
function NumberComponent(props: NumberProps) {
  return <NumberField {...props} />
}

// Exported as `Number`; named differently here so the global `Number` stays usable in this module.
export { NumberComponent as Number }

/** `<x-forms::latitude>`: a number between -90 and 90 with 6 decimals. */
export function Latitude(props: NumberProps) {
  return <NumberField step={0.000001} min={-90} max={90} decimals={6} {...props} />
}

/** `<x-forms::longitude>`: a number between -180 and 180 with 6 decimals. */
export function Longitude(props: NumberProps) {
  return <NumberField step={0.000001} min={-180} max={180} decimals={6} {...props} />
}

export interface HiddenProps extends Pick<FieldProps, "name" | "id" | "model" | "default" | "disabled"> {
  /** The value to submit; wins over old input, the model and `default`. */
  value?: string | number | boolean | null | string[]
  form?: string
}

/** `<x-forms::hidden>`: a hidden input with the same value precedence as the other fields. An array submits one input per item. */
export function Hidden({ name, id, model, default: defaultValue, value, disabled, form }: HiddenProps) {
  const fieldValue = useFieldValue(name, model, defaultValue)
  const resolved =
    value !== undefined
      ? Array.isArray(value)
        ? value
        : toFormString(value)
      : Array.isArray(fieldValue)
        ? fieldValue.map(toFormString)
        : toFormString(fieldValue)

  usePublishField({ id, name, kind: "value", value: resolved, disabled })

  if (Array.isArray(resolved)) {
    const inputName = name.endsWith("[]") ? name : `${name}[]`
    return (
      <>
        {resolved.map((item, i) => (
          <input key={i} type="hidden" name={inputName} value={item} disabled={disabled} form={form} />
        ))}
      </>
    )
  }
  return <input type="hidden" id={id} name={name} value={resolved} disabled={disabled} form={form} />
}
