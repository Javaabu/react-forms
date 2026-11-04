"use client"

import type * as React from "react"
import { useFieldValue } from "../core/binding"
import { useUi } from "../core/provider"
import { usePublishField } from "../core/registry"
import { toFormString } from "../support/data"
import { splitFieldProps, useField, useFieldState, type FieldProps, type PlaceholderProps } from "./field"

export interface WysiwygProps extends FieldProps, PlaceholderProps {
  /** Controlled HTML. */
  value?: string | null
  onChange?: (html: string) => void
  className?: string
}

/**
 * `<x-forms::wysiwyg>` (and `<x-forms::textarea wysiwyg>`): a rich text editor
 * that submits HTML. The editor comes from the adapter (`@javaabu/forms/onu/editor`
 * for Onu's Tiptap editor); without one it is a plain textarea.
 */
export function Wysiwyg(props: WysiwygProps): React.JSX.Element {
  const ui = useUi()
  const { field, rest } = splitFieldProps(props)
  const { value, placeholder, showPlaceholder, onChange, className } = rest
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
    <ui.Wysiwyg
      {...f.control}
      className={className}
      placeholder={f.placeholder}
      value={current}
      onValueChange={(html) => {
        setCurrent(html)
        onChange?.(html)
      }}
    />,
  )
}
