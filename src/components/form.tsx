"use client"

import * as React from "react"

import type { FormsComponents } from "../core/adapter"
import { Model, OldInput } from "../core/binding"
import {
  errorEntries,
  errorsFor,
  findField,
  focusField,
  focusFirstInvalid,
  readValidationErrors,
  selectErrorBag,
  toDotNotation,
  withoutField,
  type FormErrors,
  type ValidationPayload,
} from "../core/errors"
import {
  FormStateProvider,
  FormValuesProvider,
  storeFor,
  useFieldErrors,
  useFormState,
  type FormState,
  type FormStatus,
} from "../core/form-context"
import { FormsProvider, useCsrfToken, useFormsConfig, useUi } from "../core/provider"
import { registry } from "../core/registry"
import {
  formDataToObject,
  isSpoofed,
  resolveAction,
  type FormAction,
  type FormValues,
  type HttpMethod,
  type VisitOptions,
} from "../core/router"
import { useFormsTranslation } from "../core/strings"
import { useField, type FieldProps } from "./field"

/**
 * The parts of Inertia's `useForm()` result that `Form` uses. Pass the whole
 * result: `<Form form={useForm({ name: "" })}>`.
 */
export interface InertiaFormLike {
  data: unknown
  setData: (...args: never[]) => void
  errors: Record<string, string | undefined>
  processing: boolean
  progress?: { percentage?: number } | null
  submit: (...args: never[]) => void
  clearErrors: (...fields: string[]) => void
  transform?: (callback: (data: never) => unknown) => void
  reset?: (...fields: string[]) => void
}

export type FormSubmitHandler<T> = (values: T, event: React.FormEvent<HTMLFormElement>) => unknown

export interface FormProps<T = FormValues> extends Omit<
  React.ComponentProps<"form">,
  "onSubmit" | "onError" | "onProgress" | "action" | "method"
> {
  /**
   * Where the form submits: a URL, or a Laravel Wayfinder route (`store()`) or route
   * function (`update`, called with `model`). The route's method is used unless `method` is set.
   */
  action?: FormAction
  /** HTTP method. `PUT`, `PATCH` and `DELETE` are sent as `POST` with a `_method` field. Default: the route's, else `POST`. */
  method?: string
  /** Model the fields inside are bound to. Also passed to an `action` route function. */
  model?: unknown
  /** Allow file uploads (`enctype="multipart/form-data"`). */
  files?: boolean
  /** Old input (flashed request data) for the fields inside. */
  old?: Record<string, unknown> | null
  /** Add the `_token` field to non-GET forms. Default `true`. */
  csrf?: boolean
  /** Inertia's `useForm()` result. Fields bind to its data; its errors, `processing` and `progress` are shown. */
  form?: InertiaFormLike
  /**
   * Submit with your own code. Gets the values (from `FormData`, or `useForm` data).
   * Return a promise to show the processing state; throw a Laravel 422 body, an axios
   * error, a 422 `Response` or a `ValidationError` to show field errors.
   */
  onSubmit?: FormSubmitHandler<T>
  /** Errors to show, e.g. from your own request. Wins over page errors. */
  errors?: FormErrors | null
  /** The error bag to read (Laravel's `$errors->getBag()`, Inertia's `errorBag`). Also sent with Inertia visits. */
  errorBag?: string
  /** Mark the form as processing. */
  processing?: boolean
  /** Disable every field. */
  disabled?: boolean
  /** Disable fields while processing. Default `true`. */
  disableWhileProcessing?: boolean
  /**
   * Show the error summary at the top. Default `false`, as in Blade: errors show under their
   * fields. A general message (a failed submit) still shows at the top.
   */
  summary?: boolean
  summaryTitle?: React.ReactNode
  /** Focus the first invalid field when errors arrive. Default `true`. */
  focusOnError?: boolean
  /** Options for router visits: `preserveScroll`, `preserveState`, `only`, `headers`, … */
  visitOptions?: VisitOptions
  preserveScroll?: VisitOptions["preserveScroll"]
  preserveState?: VisitOptions["preserveState"]
  /** Reset the fields after a successful submit: `true`, or the names to reset. */
  resetOnSuccess?: boolean | string[]
  /** Upload progress, 0–100. */
  onProgress?: (percentage: number) => void
  onSuccess?: (result: unknown) => void
  onError?: (error: unknown, payload: ValidationPayload | null) => void
  /** Replace adapter components for this form: `{ Select: MySelect }`. */
  components?: Partial<FormsComponents>
}

const SAFE_METHODS = ["get", "head", "options"]

function isInertiaForm(value: unknown): value is InertiaFormLike {
  return !!value && typeof value === "object" && "setData" in value && "submit" in value && "processing" in value
}

/**
 * `<x-forms::form>`: a `<form>` with Laravel's method spoofing and CSRF token,
 * `files`, model binding and old input. It shows validation errors under their
 * fields and in a summary, and submits natively, through `onSubmit`, Inertia's
 * `useForm()`, or the `FormsProvider router` (Inertia visits, fetch).
 */
export function Form<T = FormValues>(props: FormProps<T>) {
  const {
    action,
    method: methodProp,
    model,
    files,
    old,
    csrf = true,
    form: inertiaForm,
    onSubmit,
    errors: errorsProp,
    errorBag,
    processing: processingProp,
    disabled,
    disableWhileProcessing = true,
    summary = false,
    summaryTitle,
    focusOnError = true,
    visitOptions,
    preserveScroll,
    preserveState,
    resetOnSuccess,
    onProgress,
    onSuccess,
    onError,
    components,
    children,
    encType,
    onChange,
    ref,
    ...formProps
  } = props

  const ui = useUi()
  const config = useFormsConfig()
  const { t } = useFormsTranslation()
  const token = useCsrfToken()
  const router = config.router
  const useForm = isInertiaForm(inertiaForm) ? inertiaForm : undefined

  const resolved = resolveAction(action, model)
  const method = ((methodProp?.toLowerCase() as HttpMethod | undefined) ?? resolved.method ?? "post") as HttpMethod
  const spoof = isSpoofed(method)
  const htmlMethod = method === "get" ? "GET" : "POST"

  // Page-level errors and old input, from the router (Inertia page props) or the provider.
  const pageErrors = router?.usePageErrors?.()
  const routerOld = router?.useOldInput?.()

  const formRef = React.useRef<HTMLFormElement>(null)
  const busy = React.useRef(false)
  const pendingFocus = React.useRef(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [status, setStatus] = React.useState<FormStatus>("idle")
  const [progress, setProgress] = React.useState<number | null>(null)
  const [serverErrors, setServerErrors] = React.useState<FormErrors | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)
  const [reset, setReset] = React.useState<{ version: number; names: string[] | null }>({ version: 0, names: null })

  // External errors (page, provider, props, useForm). Editing a field hides its error until new errors arrive.
  const external: FormErrors = {
    ...selectErrorBag(pageErrors ?? config.errors, errorBag),
    ...errorsProp,
    ...(useForm ? (useForm.errors as FormErrors) : null),
  }
  const externalKey = JSON.stringify(external)
  const [edited, setEdited] = React.useState<{ key: string; names: string[] }>({ key: externalKey, names: [] })
  const editedNames = edited.key === externalKey ? edited.names : []
  let visible = external
  for (const name of editedNames) visible = withoutField(visible, name)
  const merged = { ...visible, ...serverErrors }
  const mergedKey = JSON.stringify(merged)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `mergedKey` stands for the contents of `merged`.
  const errors = React.useMemo<FormErrors>(() => merged, [mergedKey])

  // New external errors (e.g. after an Inertia visit) move focus too. Declared before the focus effect below.
  const hasExternal = errorEntries(external).length > 0
  React.useEffect(() => {
    if (hasExternal) pendingFocus.current = true
  }, [externalKey, hasExternal])

  const processing = !!processingProp || submitting || !!useForm?.processing
  const shownProgress = useForm?.progress?.percentage ?? progress

  const setErrors = React.useCallback((next: FormErrors | null, nextMessage?: string | null) => {
    const entries = errorEntries(next)
    setServerErrors(entries.length ? Object.fromEntries(entries) : null)
    setMessage(nextMessage ?? null)
    if (entries.length || nextMessage) {
      pendingFocus.current = true
      setStatus("error")
    }
  }, [])

  const formErrors = useForm?.errors
  const formClearErrors = useForm?.clearErrors
  const clearErrors = React.useCallback(
    (name: string) => {
      setServerErrors((current) => {
        if (!current) return current
        const next = withoutField(current, name)
        return next === current ? current : Object.keys(next).length ? next : null
      })
      setEdited((current) => {
        const names = current.key === externalKey ? current.names : []
        return names.includes(name) ? current : { key: externalKey, names: [...names, name] }
      })
      if (formClearErrors && errorsFor(formErrors as FormErrors | undefined, name).length) {
        formClearErrors(toDotNotation(name))
      }
    },
    [externalKey, formErrors, formClearErrors, setEdited],
  )

  React.useEffect(() => {
    if (!pendingFocus.current) return
    pendingFocus.current = false
    if (!focusOnError) return
    if (!focusFirstInvalid(formRef.current, errors)) {
      formRef.current?.querySelector<HTMLElement>("[data-forms-summary]")?.focus()
    }
  })

  const finishWithSuccess = (result: unknown) => {
    setStatus("success")
    if (resetOnSuccess) {
      setReset((r) => ({ version: r.version + 1, names: Array.isArray(resetOnSuccess) ? resetOnSuccess : null }))
    }
    onSuccess?.(result)
  }

  const fail = async (error: unknown) => {
    const payload = await readValidationErrors(error)
    if (payload) setErrors(payload.errors, null)
    else {
      setMessage(t("submit_failed"))
      pendingFocus.current = true
    }
    setStatus("error")
    onError?.(error, payload)
  }

  const options: VisitOptions = {
    ...visitOptions,
    ...(preserveScroll !== undefined ? { preserveScroll } : null),
    ...(preserveState !== undefined ? { preserveState } : null),
  }

  async function runHandler(values: T, event: React.FormEvent<HTMLFormElement>) {
    busy.current = true
    setSubmitting(true)
    setStatus("submitting")
    setServerErrors(null)
    setMessage(null)
    try {
      finishWithSuccess(await onSubmit!(values, event))
    } catch (error) {
      await fail(error)
    } finally {
      busy.current = false
      setSubmitting(false)
    }
  }

  function submitUseForm(form: InertiaFormLike) {
    const url = resolved.url ?? (typeof window === "undefined" ? "" : window.location.href)
    // Laravel can't read multipart bodies of PUT / PATCH requests: send those as POST with `_method`.
    const viaPost = spoof && files
    form.transform?.(((data: Record<string, unknown>) => (viaPost ? { ...data, _method: method } : data)) as never)
    const submit = form.submit as unknown as (method: string, url: string, options: Record<string, unknown>) => void
    submit(viaPost ? "post" : method, url, {
      ...options,
      errorBag,
      forceFormData: files || undefined,
      onStart: () => setStatus("submitting"),
      onProgress: (event?: { percentage?: number }) => {
        if (event?.percentage !== undefined) onProgress?.(event.percentage)
      },
      onSuccess: (page: unknown) => {
        finishWithSuccess(page)
        const names = Array.isArray(resetOnSuccess) ? resetOnSuccess : []
        if (resetOnSuccess) form.reset?.(...names)
      },
      onError: (errs: FormErrors) => {
        setStatus("error")
        pendingFocus.current = true
        onError?.(errs, { errors: errs })
      },
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (busy.current || processing) {
      event.preventDefault() // no double submits
      return
    }
    const element = event.currentTarget

    if (onSubmit) {
      event.preventDefault()
      const values = (useForm ? useForm.data : formDataToObject(new FormData(element))) as T
      void runHandler(values, event)
      return
    }
    if (useForm) {
      event.preventDefault()
      submitUseForm(useForm)
      return
    }
    if (router) {
      event.preventDefault()
      const data = new FormData(element, (event.nativeEvent as SubmitEvent).submitter ?? undefined)
      busy.current = true
      setServerErrors(null)
      setMessage(null)
      router.submit(
        {
          url: resolved.url ?? window.location.href,
          method,
          data,
          form: element,
          errorBag,
          options,
        },
        {
          onStart: () => {
            setSubmitting(true)
            setStatus("submitting")
            setProgress(null)
          },
          onProgress: (percentage) => {
            setProgress(percentage)
            onProgress?.(percentage)
          },
          onSuccess: (result) => finishWithSuccess(result),
          onError: (errs, msg) => {
            setErrors(errs, msg ?? null)
            onError?.(errs, { errors: errs, message: msg ?? undefined })
          },
          onFailure: (error) => void fail(error),
          onFinish: () => {
            busy.current = false
            setSubmitting(false)
            setProgress(null)
          },
        },
      )
    }
    // Otherwise the browser submits the form.
  }

  function handleChange(event: React.ChangeEvent<HTMLFormElement>) {
    onChange?.(event)
    const name = (event.target as unknown as HTMLInputElement).name
    if (name) clearErrors(name)
  }

  const store = React.useMemo(
    () => (useForm ? storeFor(useForm as unknown as Parameters<typeof storeFor>[0]) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useForm?.data, useForm?.setData],
  )

  // Fields re-render with the form anyway (they are its children), so this isn't memoized.
  const state: FormState = {
    processing,
    status,
    progress: shownProgress ?? null,
    disabled: !!disabled || (disableWhileProcessing && processing),
    errors,
    message,
    setErrors,
    clearErrors,
    resetVersion: reset.version,
    resetNames: reset.names,
    formRef,
  }

  let content: React.ReactNode = (
    <FormStateProvider value={state}>
      <ui.Form
        {...formProps}
        ref={(node: HTMLFormElement | null) => {
          formRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        action={resolved.url}
        method={htmlMethod}
        encType={files ? "multipart/form-data" : encType}
        data-status={status}
        aria-busy={processing || undefined}
        processing={processing}
        onSubmit={handleSubmit}
        onChange={handleChange}
      >
        {csrf && !SAFE_METHODS.includes(method) && token ? <input type="hidden" name="_token" value={token} /> : null}
        {spoof ? <input type="hidden" name="_method" value={method.toUpperCase()} /> : null}
        {summary ? <ErrorSummary title={summaryTitle} /> : <ErrorSummary errors={null} title={summaryTitle} />}
        {children}
      </ui.Form>
    </FormStateProvider>
  )

  if (store) content = <FormValuesProvider value={store}>{content}</FormValuesProvider>
  const oldInput = old !== undefined ? old : routerOld
  if (oldInput !== undefined) content = <OldInput old={oldInput}>{content}</OldInput>
  if (model !== undefined && model !== null) content = <Model model={model}>{content}</Model>
  if (components) content = <FormsProvider components={components}>{content}</FormsProvider>
  return content
}

export interface ErrorSummaryProps {
  /** Errors to list. Default: the surrounding form's. */
  errors?: FormErrors | null
  /** List this error bag of `FormsProvider errors` (Blade's `bag`). */
  bag?: string
  /** A general message. Default: the form's. */
  message?: React.ReactNode
  /** Heading. Default: "Please correct the errors below." */
  title?: React.ReactNode
  /** Field labels by name: `{ email: "Email" }`. Default: the labels of the fields on the page. */
  labels?: Record<string, React.ReactNode>
  className?: string
}

/**
 * A summary of every error at the top of a form. Each entry links to its field
 * and focuses it. `Form summary` renders one at the top; or render it yourself
 * to place it elsewhere.
 */
export function ErrorSummary({
  errors: errorsProp,
  bag,
  message: messageProp,
  title,
  labels,
  className,
}: ErrorSummaryProps) {
  const ui = useUi()
  const form = useFormState()
  const config = useFormsConfig()
  const page = config.router?.usePageErrors?.()
  const { t } = useFormsTranslation()
  const errors =
    errorsProp !== undefined ? errorsProp : bag || !form ? selectErrorBag(page ?? config.errors, bag) : form.errors
  const message = messageProp !== undefined ? messageProp : form?.message
  const entries = errorEntries(errors)
  if (!entries.length && !message) return null

  const items = entries.map(([name, messages]) => ({
    name,
    label: labels?.[name] ?? registry.labelOf(name),
    messages,
  }))

  return (
    <div data-forms-summary tabIndex={-1} className="contents outline-none">
      <ui.ErrorSummary
        title={title ?? (entries.length ? t("error_summary_title") : message)}
        description={entries.length ? message : undefined}
        items={items}
        onSelect={(name) => {
          const root = form?.formRef.current ?? document
          const field = findField(root, name)
          return field ? (focusField(field), true) : false
        }}
        className={className}
      />
    </div>
  )
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
  const field = useField({ ...props, name, label })
  if (!wrap) return <>{children}</>
  const shown = blankLabel ? undefined : name || label ? field.markedLabel : undefined
  return field.wrap(children, { label: shown })
}

export interface LabelProps extends Omit<React.ComponentProps<"label">, "children"> {
  /** Label text. The children (Blade's slot) win over it. */
  label?: React.ReactNode
  required?: boolean
  children?: React.ReactNode
}

/** `<x-forms::label>`: a label with the required marker. Renders nothing without content. */
export function Label({ label, required, children, ...props }: LabelProps) {
  const ui = useUi()
  const { t } = useFormsTranslation()
  if (!children && !label) return null
  const marker = !children && required ? t("required_text") : ""
  return (
    <ui.Label {...props} required={!!marker}>
      {children ?? label}
      {marker ? <ui.RequiredMarker symbol={marker} /> : null}
    </ui.Label>
  )
}

/** `<x-forms::label-required>`: the required marker. `text` defaults to the translated `*`. */
export function LabelRequired({ text, className }: { text?: string; className?: string }) {
  const ui = useUi()
  const { t } = useFormsTranslation()
  const symbol = text ?? t("required_text")
  return symbol ? <ui.RequiredMarker symbol={symbol} className={className} /> : null
}

/** `<x-forms::input-help>`: help text under a control. */
export function InputHelp(props: { id?: string; className?: string; children?: React.ReactNode }) {
  const ui = useUi()
  return <ui.HelpText {...props} />
}

export interface ErrorsProps {
  /** Field name (bracket or dot notation). */
  name: string
  /** Read this error bag of `FormsProvider errors` instead of the form's errors. */
  bag?: string
  /** Show only the first message, like Blade's `@error`. Default `true`. */
  firstOnly?: boolean
  id?: string
  className?: string
}

/** `<x-forms::errors>`: the validation errors of one field, from the surrounding `Form`. */
export function Errors({ name, bag, firstOnly = true, ...props }: ErrorsProps) {
  const ui = useUi()
  const errors = useFieldErrors(name, bag)
  if (!errors.length) return null
  return <ui.FieldErrors {...props} errors={firstOnly ? errors.slice(0, 1) : errors} />
}

/** The surrounding form's status, for custom submit buttons and progress bars. */
export function useFormStatus() {
  const form = useFormState()
  return {
    processing: form?.processing ?? false,
    status: form?.status ?? "idle",
    progress: form?.progress ?? null,
    errors: form?.errors ?? {},
  }
}
