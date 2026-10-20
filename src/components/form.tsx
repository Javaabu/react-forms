"use client"

import * as React from "react"
import {
  FieldErrors,
  Form as OnuForm,
  HelpText,
  Label as OnuLabel,
  RequiredMarker,
  useFieldErrors,
  type FormProps as OnuFormProps,
  type FormValues,
} from "@javaabu/onu"

import { Model, OldInput } from "../context/binding"
import { useCsrfToken, useFormsTranslation } from "../context/forms-provider"
import { FieldWrapper, useFieldNames, type FieldProps } from "./field"

export interface FormProps<T extends FieldValues = FormValues> extends Omit<OnuFormProps<T>, "method"> {
  /** HTTP method. `PUT`, `PATCH` and `DELETE` are sent as `POST` with a `_method` field. Default `POST`. */
  method?: string
  /** Model the fields inside are bound to. */
  model?: unknown
  /** Allow file uploads (`enctype="multipart/form-data"`). */
  files?: boolean
  /** Old input (flashed request data) for the fields inside. */
  old?: Record<string, unknown> | null
  /** Add the `_token` field to non-GET forms. Default `true`. */
  csrf?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldValues = Record<string, any>

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"]

/**
 * `<x-forms::form>`: Onu's `Form` (server errors, error summary, processing
 * state) with Laravel's method spoofing, CSRF token, `files` and model binding.
 */
export function Form<T extends FieldValues = FormValues>({
  method = "POST",
  model,
  files,
  old,
  csrf = true,
  children,
  encType,
  ...props
}: FormProps<T>) {
  const verb = method.toUpperCase()
  const spoof = ["PUT", "PATCH", "DELETE"].includes(verb)
  const token = useCsrfToken()

  let content: React.ReactNode = (
    <OnuForm<T>
      method={spoof ? "POST" : verb}
      encType={files ? "multipart/form-data" : encType}
      {...(props as OnuFormProps<T>)}
    >
      {csrf && !SAFE_METHODS.includes(verb) && token ? <input type="hidden" name="_token" value={token} /> : null}
      {spoof ? <input type="hidden" name="_method" value={verb} /> : null}
      {children}
    </OnuForm>
  )

  if (old !== undefined) content = <OldInput old={old}>{content}</OldInput>
  if (model !== undefined && model !== null) content = <Model model={model}>{content}</Model>
  return content
}

export interface FormGroupProps extends Omit<FieldProps, "model" | "default" | "name"> {
  /** Field name: generates the label and looks up errors. */
  name?: string
  /** Render the label as an empty label (keeps the column in inline layouts). */
  blankLabel?: boolean
  /** `false` renders the children without the group. Default `true`. */
  wrap?: boolean
  children: React.ReactNode
}

/** `<x-forms::form-group>`: label, help and errors around any control. */
export function FormGroup({ name = "", label, blankLabel, wrap = true, children, ...props }: FormGroupProps) {
  const names = useFieldNames({ name, label, id: props.id })
  if (!wrap) return <>{children}</>
  const resolved = blankLabel ? undefined : name || label ? names.label : undefined
  return (
    <FieldWrapper {...props} name={name} id={names.id} label={resolved}>
      {children}
    </FieldWrapper>
  )
}

export interface LabelProps extends Omit<React.ComponentProps<typeof OnuLabel>, "children"> {
  /** Label text. The children (Blade's slot) win over it. */
  label?: React.ReactNode
  required?: boolean
  children?: React.ReactNode
}

/** `<x-forms::label>`: a label with the required marker. Renders nothing without content. */
export function Label({ label, required, children, ...props }: LabelProps) {
  if (!children && !label) return null
  return (
    <OnuLabel {...props} required={!children && required}>
      {children ?? label}
    </OnuLabel>
  )
}

/** `<x-forms::label-required>`: the required marker. `text` defaults to the translated `*`. */
export function LabelRequired({ text, ...props }: { text?: string } & Omit<React.ComponentProps<"span">, "children">) {
  const { t } = useFormsTranslation()
  const symbol = text ?? t("requiredText")
  return symbol ? <RequiredMarker symbol={symbol} {...props} /> : null
}

/** `<x-forms::input-help>`: help text under a control. */
export function InputHelp(props: React.ComponentProps<typeof HelpText>) {
  return <HelpText {...props} />
}

export interface ErrorsProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Field name (bracket or dot notation). */
  name: string
  /** Show only the first message, like Blade's `@error`. Default `true`. */
  firstOnly?: boolean
}

/** `<x-forms::errors>`: the validation errors of one field, from the surrounding `Form`. */
export function Errors({ name, firstOnly = true, ...props }: ErrorsProps) {
  const errors = useFieldErrors(name)
  return <FieldErrors {...props} errors={errors} firstOnly={firstOnly} />
}
