"use client"

import { WysiwygEditor } from "@javaabu/onu/editor"

import { defineAdapter, type WysiwygSlotProps } from "../../core/adapter"

function OnuWysiwyg({ value, onValueChange, ...props }: WysiwygSlotProps) {
  return (
    <WysiwygEditor
      {...props}
      format="html"
      value={value}
      onValueChange={(next) => onValueChange(typeof next === "string" ? next : "")}
    />
  )
}

/**
 * Onu's Tiptap editor for `Wysiwyg`. A separate entry because the editor is
 * large: `<FormsProvider ui={mergeAdapters(onu, onuEditor)}>`.
 */
export const onuEditor = defineAdapter({ name: "onu-editor", components: { Wysiwyg: OnuWysiwyg } })
