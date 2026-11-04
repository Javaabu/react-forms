"use client"

import * as React from "react"

import { useFieldValue } from "../core/binding"
import { useUi } from "../core/provider"
import { usePublishField } from "../core/registry"
import { toFormString } from "../support/data"
import { splitFieldProps, useField, useFieldState, type FieldProps, type PlaceholderProps } from "./field"

type NativeTextareaProps = Omit<
  React.ComponentProps<"textarea">,
  "name" | "id" | "value" | "defaultValue" | "placeholder" | "required" | "disabled" | "children"
>

export interface TextareaProps extends FieldProps, PlaceholderProps, NativeTextareaProps {
  /** Visible rows. Default `3`. */
  rows?: number
  /** Controlled value. Wins over old input, the model and `default`, as in Blade. */
  value?: string | null
  /** Grow with the content. Default `false`, so `rows` is respected as in Blade. */
  autoResize?: boolean
  /** Type Thaana from a Latin keyboard. */
  thaana?: boolean
}

/** `<x-forms::textarea>`. For a rich text editor use `Wysiwyg` (Blade's `wysiwyg` attribute). */
export function Textarea(props: TextareaProps) {
  const ui = useUi()
  const { field, rest } = splitFieldProps(props)
  const { value, placeholder, showPlaceholder, rows = 3, autoResize = false, thaana, onChange, ...textareaProps } = rest
  const f = useField({ ...field, placeholder, showPlaceholder })
  const initial = toFormString(useFieldValue(field.name, field.model, field.default))
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

  return f.wrap(
    <ui.Textarea
      {...textareaProps}
      {...f.control}
      rows={rows}
      autoResize={autoResize}
      thaana={thaana}
      placeholder={f.placeholder}
      value={current}
      onChange={(event) => {
        setCurrent(event.target.value)
        onChange?.(event)
      }}
    />,
  )
}
