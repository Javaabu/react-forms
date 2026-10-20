"use client"

import * as React from "react"
import {
  EmailInput,
  HiddenInput,
  NumberInput,
  PasswordInput,
  TextInput,
  UrlInput,
  type NumberInputProps,
  type TextInputProps,
} from "@javaabu/onu"

import { useFieldValue } from "../context/binding"
import { useFlagFor, usePublishField } from "../context/registry"
import { isNil, toFormString } from "../support/data"
import { FieldWrapper, splitFieldProps, useFieldNames, type FieldProps, type PlaceholderProps } from "./field"
import { useSyncedState } from "../support/use-synced-state"

type NativeInputProps = Omit<
  React.ComponentProps<"input">,
  "name" | "id" | "type" | "value" | "defaultValue" | "placeholder" | "required" | "disabled" | "size" | "children"
>

export interface InputProps extends FieldProps, PlaceholderProps, NativeInputProps {
  /** HTML input type. `email`, `password`, `number`, `url` and `hidden` use the matching Onu input. */
  type?: string
  /** Controlled value. Without it the field is uncontrolled and starts from old input / the model / `default`. */
  value?: string | number | null
  /** Content before the input (Blade's `prepend` slot). */
  prepend?: React.ReactNode
  /** Content after the input (Blade's `append` slot). */
  append?: React.ReactNode
  /** Type Thaana from a Latin keyboard. Use on free-text fields that may hold Dhivehi. */
  thaana?: TextInputProps["thaana"]
  /** Show a Thaana/Latin toggle when `thaana` is on. */
  thaanaToggle?: boolean
  classNames?: TextInputProps["classNames"]
}

/**
 * When a `Select2` names this field as its `fallback`, the field is only
 * enabled and shown while the select has no options.
 */
export function useFallback(id: string | undefined, name: string) {
  const flag = useFlagFor("fallback", id, name) as { active: boolean } | undefined
  return flag ? { hidden: !flag.active, disabled: !flag.active } : null
}

function useTextValue(props: Pick<InputProps, "name" | "model" | "default" | "value" | "type">) {
  const fieldValue = useFieldValue(props.name, props.model, props.default)
  // Like Blade, password fields never echo a value back.
  const initial = props.type === "password" ? "" : toFormString(fieldValue)
  const controlled = props.value !== undefined
  const [current, setCurrent] = useSyncedState(initial)
  return { initial, controlled, current: controlled ? toFormString(props.value) : current, setCurrent }
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

function TextLikeField(props: InputProps) {
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
  const names = useFieldNames({ ...field, placeholder, showPlaceholder })
  const id = names.id
  const text = useTextValue({ ...field, value, type })
  const fallback = useFallback(id, field.name)
  const disabled = field.disabled || fallback?.disabled || undefined

  usePublishField({ id, name: field.name, kind: "value", value: text.current, disabled })

  const control = {
    ...inputProps,
    id,
    name: field.name,
    placeholder: names.placeholder,
    required: field.required || undefined,
    disabled,
    startAddon: prepend,
    endAddon: append,
    ...(text.controlled ? { value: toFormString(value) } : { defaultValue: text.initial }),
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      text.setCurrent(event.target.value)
      onChange?.(event)
    },
  }

  let input: React.ReactNode
  switch (type) {
    case "email":
      input = <EmailInput {...control} />
      break
    case "password":
      input = <PasswordInput {...control} />
      break
    case "url":
      input = <UrlInput {...control} />
      break
    case "tel":
      input = (
        <TextInput {...control} type="tel" dir="ltr" inputMode="tel" autoComplete={control.autoComplete ?? "tel"} />
      )
      break
    default:
      input = <TextInput {...control} type={type} thaana={thaana} thaanaToggle={thaanaToggle} />
  }

  const wrapped = (
    <FieldWrapper {...field} id={id} label={names.label} disabled={disabled}>
      {/* Remount when the starting value changes (e.g. the model loaded after the first render). */}
      <React.Fragment key={text.controlled ? undefined : text.initial}>{input}</React.Fragment>
    </FieldWrapper>
  )

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

/** `<x-forms::password>`: never pre-filled, with a show/hide button. */
export function Password(props: Omit<InputProps, "type" | "thaana" | "thaanaToggle" | "default" | "value">) {
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

type NumberControlProps = Omit<
  NumberInputProps,
  "name" | "id" | "value" | "defaultValue" | "placeholder" | "required" | "disabled" | "startAddon" | "endAddon"
>

export interface NumberProps extends FieldProps, PlaceholderProps, NumberControlProps {
  /** Controlled value. */
  value?: number | string | null
  prepend?: React.ReactNode
  append?: React.ReactNode
}

function toNumber(value: unknown): number | null {
  if (isNil(value) || value === "") return null
  const n = typeof value === "number" ? value : globalThis.Number(value)
  return globalThis.Number.isFinite(n) ? n : null
}

function NumberField(props: NumberProps) {
  const { field, rest } = splitFieldProps(props)
  const { value, placeholder, showPlaceholder, prepend, append, onValueChange, formatOptions, ...numberProps } = rest
  const names = useFieldNames({ ...field, placeholder, showPlaceholder })
  const fieldValue = useFieldValue(field.name, field.model, field.default)
  const initial = toNumber(fieldValue)
  const [current, setCurrent] = useSyncedState(initial)
  const controlled = value !== undefined

  usePublishField({
    id: names.id,
    name: field.name,
    kind: "value",
    value: controlled ? toNumber(value) : current,
    disabled: field.disabled,
  })

  return (
    <FieldWrapper {...field} id={names.id} label={names.label}>
      <NumberInput
        {...numberProps}
        key={controlled ? undefined : String(initial)}
        id={names.id}
        name={field.name}
        placeholder={names.placeholder}
        required={field.required || undefined}
        disabled={field.disabled || undefined}
        startAddon={prepend}
        endAddon={append}
        // Blade prints the raw number; keep it ungrouped with all its decimals.
        formatOptions={formatOptions ?? { useGrouping: false, maximumFractionDigits: 10 }}
        {...(controlled ? { value: toNumber(value) } : { defaultValue: initial })}
        onValueChange={(n) => {
          setCurrent(n)
          onValueChange?.(n)
        }}
      />
    </FieldWrapper>
  )
}

/** `<x-forms::number>`: locale-aware number field that submits the raw number. */
function NumberComponent(props: NumberProps) {
  return <NumberField {...props} />
}

// Exported as `Number`; named differently here so the global `Number` stays usable in this module.
export { NumberComponent as Number }

/** `<x-forms::latitude>`: a number between -90 and 90 with 6 decimals. */
export function Latitude(props: NumberProps) {
  return (
    <NumberField
      step={0.000001}
      min={-90}
      max={90}
      formatOptions={{ useGrouping: false, maximumFractionDigits: 6 }}
      {...props}
    />
  )
}

/** `<x-forms::longitude>`: a number between -180 and 180 with 6 decimals. */
export function Longitude(props: NumberProps) {
  return (
    <NumberField
      step={0.000001}
      min={-180}
      max={180}
      formatOptions={{ useGrouping: false, maximumFractionDigits: 6 }}
      {...props}
    />
  )
}

export interface HiddenProps extends Pick<FieldProps, "name" | "id" | "model" | "default" | "disabled"> {
  /** The value to submit; wins over old input, the model and `default`. */
  value?: string | number | boolean | null | string[]
  form?: string
}

/** `<x-forms::hidden>`: a hidden input with the same value precedence as the other fields. */
export function Hidden({ name, id, model, default: defaultValue, value, disabled, form }: HiddenProps) {
  const fieldValue = useFieldValue(name, model, defaultValue)
  const resolved =
    value !== undefined ? value : Array.isArray(fieldValue) ? fieldValue.map(toFormString) : toFormString(fieldValue)

  usePublishField({ id, name, kind: "value", value: resolved, disabled })

  return <HiddenInput id={id} name={name} value={resolved} disabled={disabled} form={form} />
}
