"use client"

import * as React from "react"
import {
  DatePicker,
  DateTimePicker,
  TimePicker,
  type DatePickerProps,
  type DateTimePickerProps,
  type TimePickerProps,
} from "@javaabu/onu"

import { useFieldValue } from "../context/binding"
import { usePublishField } from "../context/registry"
import { parseDateValue, toDateString, toDateTimeString, toTimeString } from "../support/dates"
import { FieldWrapper, splitFieldProps, useFieldNames, type FieldProps, type PlaceholderProps } from "./field"
import { useSyncedState } from "../support/use-synced-state"

type PickerOwnProps = "name" | "id" | "value" | "defaultValue" | "placeholder" | "required" | "disabled"

interface DateFieldBase extends FieldProps, PlaceholderProps {
  /** Controlled value: a `Date`, or a Laravel date string. */
  value?: Date | string | null
  onChange?: (value: Date | null) => void
}

export type DateProps = DateFieldBase & Omit<DatePickerProps, PickerOwnProps | "onChange">
export type DatetimeProps = DateFieldBase & Omit<DateTimePickerProps, PickerOwnProps | "onChange">
export type TimeProps = DateFieldBase & Omit<TimePickerProps, PickerOwnProps | "onChange">

type Picker = "date" | "datetime" | "time"

const FORMATTERS: Record<Picker, (d: Date) => string> = {
  date: toDateString,
  datetime: toDateTimeString,
  time: toTimeString,
}

function DateField({ picker, ...props }: (DateProps | DatetimeProps | TimeProps) & { picker: Picker }) {
  const { field, rest } = splitFieldProps(props)
  const { value, onChange, placeholder, showPlaceholder, ...pickerProps } = rest
  const names = useFieldNames({ ...field, placeholder, showPlaceholder })
  const raw = useFieldValue(field.name, field.model, field.default)
  const initial = React.useMemo(() => parseDateValue(raw), [raw])
  const initialKey = initial ? initial.getTime() : ""
  const controlled = value !== undefined
  const [current, setCurrent] = useSyncedState<Date | null>(initial, initialKey)
  const shown = controlled ? parseDateValue(value) : current

  usePublishField({
    id: names.id,
    name: field.name,
    kind: "value",
    value: shown ? FORMATTERS[picker](shown) : "",
    disabled: field.disabled,
  })

  const common = {
    ...pickerProps,
    id: names.id,
    name: field.name,
    placeholder: names.placeholder,
    required: field.required || undefined,
    disabled: field.disabled || undefined,
    ...(controlled ? { value: parseDateValue(value) } : { defaultValue: initial }),
    onChange: (next: Date | null) => {
      setCurrent(next)
      onChange?.(next)
    },
  }

  return (
    <FieldWrapper {...field} id={names.id} label={names.label}>
      <React.Fragment key={controlled ? undefined : String(initialKey)}>
        {picker === "date" ? (
          <DatePicker {...(common as DatePickerProps)} />
        ) : picker === "datetime" ? (
          <DateTimePicker {...(common as DateTimePickerProps)} />
        ) : (
          <TimePicker {...(common as TimePickerProps)} />
        )}
      </React.Fragment>
    </FieldWrapper>
  )
}

/** `<x-forms::date>`: a date picker that submits `yyyy-MM-dd`. */
function DateComponent(props: DateProps) {
  return <DateField {...props} picker="date" />
}

/** `<x-forms::datetime>`: a date and time picker that submits `yyyy-MM-ddTHH:mm:ss`. */
export function Datetime(props: DatetimeProps) {
  return <DateField {...props} picker="datetime" />
}

/** `<x-forms::time>`: a time picker that submits `HH:mm`. */
export function Time(props: TimeProps) {
  return <DateField {...props} picker="time" />
}

// Exported as `Date`; named differently here so the global `Date` stays usable.
export { DateComponent as Date }
