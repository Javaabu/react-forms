"use client"

import * as React from "react"
import { Textarea as OnuTextarea, type TextareaProps as OnuTextareaProps } from "@javaabu/onu"

import { useFieldValue } from "../context/binding"
import { usePublishField } from "../context/registry"
import { toFormString } from "../support/data"
import { FieldWrapper, splitFieldProps, useFieldNames, type FieldProps, type PlaceholderProps } from "./field"
import { useSyncedState } from "../support/use-synced-state"

type NativeTextareaProps = Omit<
  OnuTextareaProps,
  "name" | "id" | "value" | "defaultValue" | "placeholder" | "required" | "disabled" | "children"
>

export interface TextareaProps extends FieldProps, PlaceholderProps, NativeTextareaProps {
  /** Visible rows. Default `3`. */
  rows?: number
  /** Controlled value. Wins over old input, the model and `default`, as in Blade. */
  value?: string | null
  /** Grow with the content. Default `false`, so `rows` is respected as in Blade. */
  autoResize?: boolean
}

/**
 * `<x-forms::textarea>`. For a rich text editor use `Wysiwyg` from
 * `@javaabu/react-forms/editor` (Blade's `wysiwyg` attribute).
 */
export function Textarea(props: TextareaProps) {
  const { field, rest } = splitFieldProps(props)
  const { value, placeholder, showPlaceholder, rows = 3, autoResize = false, onChange, ...textareaProps } = rest
  const names = useFieldNames({ ...field, placeholder, showPlaceholder })
  const initial = toFormString(useFieldValue(field.name, field.model, field.default))
  const controlled = value !== undefined
  const [current, setCurrent] = useSyncedState(initial)

  usePublishField({
    id: names.id,
    name: field.name,
    kind: "value",
    value: controlled ? toFormString(value) : current,
    disabled: field.disabled,
  })

  return (
    <FieldWrapper {...field} id={names.id} label={names.label}>
      <OnuTextarea
        {...textareaProps}
        key={controlled ? undefined : initial}
        id={names.id}
        name={field.name}
        rows={rows}
        autoResize={autoResize}
        placeholder={names.placeholder}
        required={field.required || undefined}
        disabled={field.disabled || undefined}
        {...(controlled ? { value: toFormString(value) } : { defaultValue: initial })}
        onChange={(event) => {
          setCurrent(event.target.value)
          onChange?.(event)
        }}
      />
    </FieldWrapper>
  )
}
