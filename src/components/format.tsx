"use client"

import * as React from "react"
import { StatusBadge } from "@javaabu/onu"

import { useFormsTranslation } from "../context/forms-provider"
import { isNil } from "../support/data"

/** Bootstrap colours (`getColor()` of a status enum) mapped to Onu status tones. */
export function colorToTone(color: string | undefined) {
  switch (color) {
    case "success":
      return "success"
    case "danger":
      return "danger"
    case "warning":
      return "warning"
    case "info":
    case "primary":
      return "info"
    default:
      return "neutral"
  }
}

/** An enum serialized as `{ value, label }`, optionally with a status `color`. */
interface EnumLike {
  label: React.ReactNode
  color?: string
}

function isEnumLike(value: unknown): value is EnumLike {
  return !!value && typeof value === "object" && !Array.isArray(value) && "label" in value
}

function itemLabel(item: unknown): React.ReactNode {
  if (isEnumLike(item)) return item.label
  if (item && typeof item === "object" && "name" in item) return String((item as { name: unknown }).name)
  if (React.isValidElement(item)) return item
  return isNil(item) ? "" : String(item)
}

export interface FormattedValueProps {
  value: unknown
  /** Keep line breaks. */
  multiline?: boolean
  /** Render the value as HTML. Only for trusted, sanitized HTML, as `{!! $value !!}` in Blade. */
  wysiwyg?: boolean
  /** How arrays are shown: a bulleted list (text entries) or joined with the list separator (table cells). */
  arrays?: "list" | "inline"
}

/**
 * javaabu/forms `FormatsValues`: enums show their label (or a status badge when
 * they have a colour), booleans Yes / No, empty values "-", arrays a list.
 */
export function FormattedValue({ value, multiline, wysiwyg, arrays = "list" }: FormattedValueProps) {
  const { t } = useFormsTranslation()

  if (React.isValidElement(value)) return value
  if (isEnumLike(value)) {
    return value.color ? <StatusBadge status={colorToTone(value.color)}>{value.label}</StatusBadge> : <>{value.label}</>
  }
  if (typeof value === "boolean") return <>{value ? t("yes") : t("no")}</>
  if (Array.isArray(value)) {
    if (!value.length) return <>{t("blank")}</>
    if (arrays === "inline") {
      return (
        <>
          {value.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 ? t("tableArraySeparator") : null}
              {itemLabel(item)}
            </React.Fragment>
          ))}
        </>
      )
    }
    return (
      <ul className="ps-5 list-disc">
        {value.map((item, i) => (
          <li key={i}>{itemLabel(item)}</li>
        ))}
      </ul>
    )
  }
  const empty = isNil(value) || value === "" || (typeof value === "number" && Number.isNaN(value))
  if (empty) return <>{t("blank")}</>
  if (wysiwyg && typeof value === "string") return <div dangerouslySetInnerHTML={{ __html: value }} />
  if (typeof value === "object") return <>{itemLabel(value)}</>
  if (multiline) return <span className="whitespace-pre-line">{String(value)}</span>
  return <>{String(value)}</>
}
