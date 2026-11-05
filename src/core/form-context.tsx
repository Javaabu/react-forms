"use client"

import * as React from "react"

import { dataGet, dataHas } from "../support/data"
import { errorsFor, selectErrorBag, toDotNotation, type FormErrors } from "./errors"
import { useFormsConfig } from "./provider"

export type FormStatus = "idle" | "submitting" | "success" | "error"

export interface FormState {
  /** `true` while the form submits. */
  processing: boolean
  status: FormStatus
  /** Upload progress (0–100) of the current submit, or `null`. */
  progress: number | null
  /** Fields are disabled (the form's `disabled`, or while processing). */
  disabled: boolean
  /** Every error the form shows, in dot notation. */
  errors: FormErrors
  /** A general message (e.g. "The form could not be submitted."). */
  message: string | null
  /** Show errors, e.g. from your own request. Focuses the first invalid field. */
  setErrors: (errors: FormErrors | null, message?: string | null) => void
  /** Clears a field's errors; fields call it when edited. */
  clearErrors: (name: string) => void
  /** Goes up when the fields should return to their starting values (`reset`). */
  resetVersion: number
  /** Field names to reset, or `null` for all. */
  resetNames: string[] | null
  formRef: React.RefObject<HTMLFormElement | null>
}

const FormStateContext = React.createContext<FormState | null>(null)

/** Provides a form's state to the fields inside. `Form` renders it. */
export const FormStateProvider = FormStateContext.Provider

/** The surrounding `Form`'s state (processing, status, progress, errors), or `null` outside one. */
export function useFormState(): FormState | null {
  return React.useContext(FormStateContext)
}

/**
 * Where field values live when something outside the fields owns them, e.g.
 * Inertia's `useForm()`. Fields read and write through it instead of their own state.
 */
export interface FormValuesStore {
  has: (name: string) => boolean
  get: (name: string) => unknown
  set: (name: string, value: unknown) => void
  /** Sets a value from the current one; for checkbox groups that share an array. */
  update: (name: string, updater: (current: unknown) => unknown) => void
}

const FormValuesContext = React.createContext<FormValuesStore | null>(null)

export const FormValuesProvider = FormValuesContext.Provider

export function useFormValues(): FormValuesStore | null {
  return React.useContext(FormValuesContext)
}

/** Sets `path` (dot notation) on a copy of `target`, creating objects / arrays on the way. */
export function setIn<T>(target: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".")
  if (head === undefined) return target
  const source = (target ?? {}) as Record<string, unknown> | unknown[]
  const copy: Record<string, unknown> | unknown[] = Array.isArray(source) ? [...source] : { ...source }
  const next = rest.length ? setIn((source as Record<string, unknown>)[head], rest.join("."), value) : value
  if (Array.isArray(copy) && /^\d+$/.test(head)) copy[Number(head)] = next
  else (copy as Record<string, unknown>)[head] = next
  return copy as T
}

/** A store over an Inertia-style `{ data, setData }` form. Bracket names (`address[city]`) map to nested data. */
export function storeFor(form: {
  data: unknown
  setData: (updater: (data: never) => unknown) => void
}): FormValuesStore {
  const path = (name: string) => toDotNotation(name)
  return {
    has: (name) => dataHas(form.data, path(name)),
    get: (name) => dataGet(form.data, path(name)),
    set: (name, value) => form.setData(((data: unknown) => setIn(data, path(name), value)) as never),
    update: (name, updater) =>
      form.setData(((data: unknown) => setIn(data, path(name), updater(dataGet(data, path(name))))) as never),
  }
}

const NO_ERRORS: string[] = []

/**
 * The errors of one field: from the surrounding `Form`, or, outside a form or
 * with a `bag`, from `FormsProvider errors` (the default bag, or the named one).
 */
export function useFieldErrors(name: string | undefined, bag?: string): string[] {
  const form = useFormState()
  const { errors: provided, router } = useFormsConfig()
  const page = router?.usePageErrors?.()
  // A named bag reads the page's errors (router or provider); otherwise the form's.
  const errors = form && !bag ? form.errors : selectErrorBag(page ?? provided, bag)
  const list = errorsFor(errors, name)
  return list.length ? list : NO_ERRORS
}
