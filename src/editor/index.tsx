"use client"

import * as React from "react"
import { WysiwygEditor, type WysiwygEditorProps } from "@javaabu/onu/editor"

import { useFieldValue } from "../context/binding"
import { usePublishField } from "../context/registry"
import {
  FieldWrapper,
  splitFieldProps,
  useFieldNames,
  type FieldProps,
  type PlaceholderProps,
} from "../components/field"
import { toFormString } from "../support/data"

export interface WysiwygProps
  extends
    FieldProps,
    PlaceholderProps,
    Omit<WysiwygEditorProps, "name" | "id" | "value" | "defaultValue" | "placeholder" | "disabled" | "format"> {
  /** Controlled HTML. */
  value?: string | null
}

/**
 * `<x-forms::wysiwyg>` (and `<x-forms::textarea wysiwyg>`): a rich text editor
 * that submits HTML. Uses Onu's Tiptap editor instead of TinyMCE.
 */
export function Wysiwyg(props: WysiwygProps) {
  const { field, rest } = splitFieldProps(props)
  const { value, placeholder, showPlaceholder, onChange, ...editorProps } = rest
  const names = useFieldNames({ ...field, placeholder, showPlaceholder })
  const initial = toFormString(useFieldValue(field.name, field.model, field.default))
  const controlled = value !== undefined
  const [current, setCurrent] = React.useState(initial)

  usePublishField({
    id: names.id,
    name: field.name,
    kind: "value",
    value: controlled ? value : current,
    disabled: field.disabled,
  })

  return (
    <FieldWrapper {...field} id={names.id} label={names.label}>
      <WysiwygEditor
        {...editorProps}
        key={controlled ? undefined : initial}
        id={names.id}
        name={field.name}
        format="html"
        placeholder={names.placeholder}
        disabled={field.disabled}
        {...(controlled ? { value: value ?? "" } : { defaultValue: initial })}
        onChange={(next, editor) => {
          setCurrent(typeof next === "string" ? next : "")
          onChange?.(next, editor)
        }}
      />
    </FieldWrapper>
  )
}
