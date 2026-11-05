"use client"

import * as React from "react"

import type { ModelProp } from "../core/binding"
import { useFieldErrors, useFormState, useFormValues } from "../core/form-context"
import { useUi } from "../core/provider"
import { useFormsTranslation } from "../core/strings"
import { nameToId, nameToLabel } from "../support/str"
import { useSyncedState } from "../support/use-synced-state"

/** Props shared by every form field, named after the javaabu/forms Blade attributes (camelCase). */
export interface FieldProps {
  /** Input name. Generates the id and label, and looks up bound values, old input and errors. */
  name: string
  /** Label. Default: a title-cased label generated from `name`, translated with `__()`. */
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

/** The label with the required marker, as every adapter receives it. */
export function useLabelWithMarker(label: React.ReactNode, required: boolean | undefined): React.ReactNode {
  const ui = useUi()
  const { t } = useFormsTranslation()
  if (!label) return label
  if (!required) return label
  const symbol = t("required_text")
  return (
    <>
      {label}
      {symbol ? <ui.RequiredMarker symbol={symbol} /> : null}
    </>
  )
}

export interface UseFieldOptions extends Omit<FieldProps, "model" | "default">, PlaceholderProps {
  /** Override the generated id (e.g. grouped checkboxes). */
  controlId?: string
  /** The field wrapper's label is not shown (checkboxes show it beside the box). */
  labelInControl?: boolean
}

/**
 * Everything a field component needs from the core: ids, label, errors,
 * the disabled state and the ARIA props of its control, and `wrap()` to put
 * the control in the adapter's `Field`.
 */
export function useField(options: UseFieldOptions) {
  const ui = useUi()
  const form = useFormState()
  const names = useFieldNames(options)
  const generatedId = React.useId()
  const id = options.controlId ?? names.id
  const baseId = id ?? `field${generatedId.replace(/:/g, "")}`
  const errors = useFieldErrors(options.name)
  const shownErrors = options.showErrors === false ? [] : errors
  const invalid = shownErrors.length > 0
  const disabled = !!options.disabled || !!form?.disabled
  const helpId = options.help ? `${baseId}-help` : undefined
  const errorId = invalid ? `${baseId}-error` : undefined
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined
  const markedLabel = useLabelWithMarker(names.label, options.required)

  const control = {
    id,
    name: options.name,
    required: options.required || undefined,
    disabled: disabled || undefined,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
  }

  const wrap = (children: React.ReactNode, overrides: { label?: React.ReactNode; help?: React.ReactNode } = {}) => (
    <ui.Field
      id={id}
      name={options.name}
      label={"label" in overrides ? overrides.label : options.labelInControl ? undefined : markedLabel}
      labelId={`${baseId}-label`}
      hideLabel={options.showLabel === false}
      required={options.required}
      disabled={disabled}
      inline={options.inline}
      help={overrides.help ?? options.help}
      helpId={(overrides.help ?? options.help) ? `${baseId}-help` : undefined}
      errors={shownErrors}
      errorId={errorId}
      classNames={{
        group: options.formGroupClass,
        label: options.inlineLabelClass,
        control: options.inlineInputClass,
      }}
    >
      {children}
    </ui.Field>
  )

  return {
    ...names,
    id,
    baseId,
    label: names.label,
    markedLabel,
    errors: shownErrors,
    invalid,
    disabled,
    helpId,
    errorId,
    describedBy,
    control,
    wrap,
  }
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

export interface FieldStateOptions<T> {
  /** The user's controlled value; `undefined` when uncontrolled. */
  controlled?: T
  /** Changes when the starting value changes (the model loaded later). Default: `initial`. */
  key?: unknown
  /** Converts between the field's value and the external store's (`useForm` data). */
  toStore?: (value: T) => unknown
  fromStore?: (raw: unknown) => T
  /** `false`: never read or write the form's external store (the component handles it). */
  store?: boolean
}

/**
 * A field's value. In order: the user's `value` prop, the form's external
 * store (Inertia `useForm` data) when it has the field, or the field's own state,
 * starting at `initial` (old input → model → default) and returning to it on a reset.
 */
export function useFieldState<T>(name: string, initial: T, options: FieldStateOptions<T> = {}) {
  const external = useFormValues()
  const store = options.store === false ? null : external
  const form = useFormState()
  const resets = !form || !form.resetNames || form.resetNames.includes(name)
  const resetVersion = resets ? (form?.resetVersion ?? 0) : 0
  const [own, setOwn] = useSyncedState(initial, `${String(options.key ?? JSON.stringify(initial))}:${resetVersion}`)
  const inStore = !!store && store.has(name)
  const stored = inStore ? (options.fromStore ? options.fromStore(store.get(name)) : (store.get(name) as T)) : own

  // A store submits only what it holds, so give it the starting value of fields it doesn't know yet.
  React.useEffect(() => {
    if (store && name && !store.has(name)) store.set(name, options.toStore ? options.toStore(initial) : initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, name])

  const set = React.useCallback(
    (next: T) => {
      setOwn(next)
      if (store) store.set(name, options.toStore ? options.toStore(next) : next)
      form?.clearErrors(name)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, name, form?.clearErrors, setOwn],
  )

  return [options.controlled !== undefined ? options.controlled : stored, set] as const
}
