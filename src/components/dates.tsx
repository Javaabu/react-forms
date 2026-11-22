"use client"

import * as React from "react"

import type { DateMode } from "../core/adapter"
import { useFieldValue } from "../core/binding"
import { useSetting, useUi } from "../core/provider"
import { usePublishField } from "../core/registry"
import {
  hasTimeZone,
  parseDateValue,
  toDateString,
  toDateTimeString,
  toTimeString,
  toZonedWallTime,
} from "../support/dates"
import { splitFieldProps, useField, useFieldState, type FieldProps, type PlaceholderProps } from "./field"

export interface DateProps extends FieldProps, PlaceholderProps {
  /** Controlled value: a `Date`, or a Laravel date string. */
  value?: Date | string | null
  /** The new value, as submitted (`yyyy-MM-dd`, `yyyy-MM-dd HH:mm:ss` or `HH:mm`), and as a `Date`. */
  onChange?: (value: string, date: Date | null) => void
  /** Earliest value: a `Date` or a Laravel date string. */
  min?: Date | string
  /** Latest value. */
  max?: Date | string
  className?: string
}

export type DatetimeProps = DateProps
export type TimeProps = DateProps

const FORMATTERS: Record<DateMode, (d: Date) => string> = {
  date: toDateString,
  datetime: toDateTimeString,
  time: toTimeString,
}

/**
 * Formats any date value the way the field submits it, or `""`.
 *
 * A string with a time zone (`2024-05-01T04:30:00.000000Z`, Laravel's JSON for date casts) is an
 * instant. With `timeZone` (the app's, the `app_timezone` setting) it shows that zone's wall time.
 * Without it, `date` mode keeps the date as written and the other modes use the browser's zone.
 * Strings without a zone and `Date` objects are local time.
 */
export function formatDateValue(value: unknown, mode: DateMode, timeZone?: string): string {
  if (hasTimeZone(value)) {
    const instant = parseDateValue(value)
    const wall = instant && timeZone ? toZonedWallTime(instant, timeZone) : null
    if (wall) return FORMATTERS[mode](wall)
    if (mode === "date") return value.trim().slice(0, 10)
  }
  const date = parseDateValue(value)
  return date ? FORMATTERS[mode](date) : ""
}

function DateField({ mode, ...props }: DateProps & { mode: DateMode }) {
  const ui = useUi()
  const { field, rest } = splitFieldProps(props)
  const { value, onChange, placeholder, showPlaceholder, min, max, className } = rest
  const f = useField({ ...field, placeholder, showPlaceholder })
  const timeZone = useSetting<string>("app_timezone") || undefined
  const raw = useFieldValue(field.name, field.model, field.default)
  const initial = React.useMemo(() => formatDateValue(raw, mode, timeZone), [raw, mode, timeZone])
  const [current, setCurrent] = useFieldState(field.name, initial, {
    controlled: value === undefined ? undefined : formatDateValue(value, mode, timeZone),
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
    <ui.Date
      {...f.control}
      className={className}
      mode={mode}
      placeholder={f.placeholder}
      min={min === undefined ? undefined : formatDateValue(min, mode, timeZone)}
      max={max === undefined ? undefined : formatDateValue(max, mode, timeZone)}
      value={current}
      onValueChange={(next) => {
        setCurrent(next)
        onChange?.(next, parseDateValue(next))
      }}
    />,
  )
}

/** `<x-forms::date>`: a date picker that submits `yyyy-MM-dd`. */
function DateComponent(props: DateProps) {
  return <DateField {...props} mode="date" />
}

/** `<x-forms::datetime>`: a date and time picker that submits `yyyy-MM-dd HH:mm:ss`. */
export function Datetime(props: DatetimeProps) {
  return <DateField {...props} mode="datetime" />
}

/** `<x-forms::time>`: a time picker that submits `HH:mm`. */
export function Time(props: TimeProps) {
  return <DateField {...props} mode="time" />
}

// Exported as `Date`; named differently here so the global `Date` stays usable.
export { DateComponent as Date }
