"use client"

import * as React from "react"
import { FormErrorsProvider, FormField } from "@javaabu/onu"

import { useFormsTranslation } from "../context/forms-provider"
import type { ModelProp } from "../context/binding"
import { nameToId, nameToLabel } from "../support/str"

/** Props shared by every form field, named after the javaabu/forms Blade attributes (camelCase). */
export interface FieldProps {
  /** Input name. Generates the id and label, and looks up bound values, old input and errors. */
  name: string
  /** Label. Default: a title-cased label generated from `name` (passed through `FormsProvider translate`). */
  label?: React.ReactNode
  /** Control id. Default: generated from `name` (`address[city]` → `address-city`). */
  id?: string
  /** Binding target. Default: the surrounding `Form` / `Model`; `false` ignores it. */
  model?: ModelProp
  /** Value when there is no old input and the bound value is `null` / `undefined`. */
  default?: unknown
  /** Adds the `required` attribute and the required marker to the label. */
  required?: boolean
  disabled?: boolean
  /** `false` hides the label visually (it stays the accessible name). Default `true`. */
  showLabel?: boolean
  /** `false` hides validation errors and the invalid state. Default `true`. */
  showErrors?: boolean
  /** Label beside the control instead of above it. */
  inline?: boolean
  /** Classes for the label (Blade's `inline-label-class`). */
  inlineLabelClass?: string
  /** Classes for the control column (Blade's `inline-input-class`). */
  inlineInputClass?: string
  /** Classes for the field wrapper (Blade's form group). */
  formGroupClass?: string
  /** Help text under the control (Blade's `help` slot). */
  help?: React.ReactNode
}

/** Placeholder props of text-like fields. */
export interface PlaceholderProps {
  placeholder?: string
  /** Use the label as the placeholder when `placeholder` is empty. */
  showPlaceholder?: boolean
}

/** Resolves the id, label and placeholder javaabu/forms derives from a field name. */
export function useFieldNames({
  name,
  id,
  label,
  placeholder,
  showPlaceholder,
}: Pick<FieldProps, "name" | "id" | "label"> & PlaceholderProps) {
  const { translate } = useFormsTranslation()
  const generated = React.useMemo(() => translate(nameToLabel(name)), [name, translate])
  const resolvedLabel = label === undefined || label === null || label === "" ? generated : label
  const labelText = typeof resolvedLabel === "string" ? resolvedLabel : generated
  return {
    id: id || nameToId(name) || undefined,
    label: resolvedLabel,
    labelText,
    placeholder: placeholder || (showPlaceholder ? labelText : undefined),
  }
}

export interface FieldWrapperProps extends Omit<FieldProps, "model" | "default" | "label" | "id"> {
  id?: string
  label?: React.ReactNode
  children: React.ReactNode
  /** Render the control without the field around it (hidden inputs). */
  bare?: boolean
}

/**
 * The Blade `form-group`: label, control, help and errors, on Onu's `FormField`.
 * `showErrors={false}` hides this field's server errors; `showLabel={false}`
 * keeps the label for screen readers only.
 */
export function FieldWrapper({
  name,
  id,
  label,
  required,
  disabled,
  showLabel = true,
  showErrors = true,
  inline,
  inlineLabelClass,
  inlineInputClass,
  formGroupClass,
  help,
  bare,
  children,
}: FieldWrapperProps) {
  if (bare) return <>{children}</>

  const field = (
    <FormField
      label={label}
      name={name}
      id={id}
      help={help}
      required={required}
      disabled={disabled}
      labelLayout={inline ? "inline" : undefined}
      hideLabel={!showLabel}
      className={formGroupClass}
      classNames={{ label: inlineLabelClass, control: inlineInputClass }}
    >
      {children}
    </FormField>
  )

  return showErrors ? field : <FormErrorsProvider errors={null}>{field}</FormErrorsProvider>
}

/** Splits field props from the props passed on to the control. */
export function splitFieldProps<P extends FieldProps>(props: P) {
  const {
    name,
    label,
    id,
    model,
    default: defaultValue,
    required,
    disabled,
    showLabel,
    showErrors,
    inline,
    inlineLabelClass,
    inlineInputClass,
    formGroupClass,
    help,
    ...rest
  } = props
  return {
    field: {
      name,
      label,
      id,
      model,
      default: defaultValue,
      required,
      disabled,
      showLabel,
      showErrors,
      inline,
      inlineLabelClass,
      inlineInputClass,
      formGroupClass,
      help,
    } satisfies FieldProps,
    rest,
  }
}
