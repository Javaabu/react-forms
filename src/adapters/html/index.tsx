"use client"

import * as React from "react"

import {
  defineAdapter,
  type AccordionSlotProps,
  type ActionMenuSlotProps,
  type AlertSlotProps,
  type ButtonGroupSlotProps,
  type ButtonSlotProps,
  type CardSlotProps,
  type CheckboxSlotProps,
  type DateSlotProps,
  type DescriptionItemSlotProps,
  type DescriptionListSlotProps,
  type EmptyStateSlotProps,
  type ErrorSummarySlotProps,
  type FieldErrorsSlotProps,
  type FieldSlotProps,
  type FileSlotProps,
  type FormSlotProps,
  type HelpTextSlotProps,
  type IconName,
  type IconSlotProps,
  type ImageSlotProps,
  type InputSlotProps,
  type LabelSlotProps,
  type LinkButtonSlotProps,
  type LinkSlotProps,
  type ModalSlotProps,
  type NavTabsSlotProps,
  type NumberSlotProps,
  type PaginationSlotProps,
  type RadioSlotProps,
  type RequiredMarkerSlotProps,
  type SelectOption,
  type SelectSlotProps,
  type StatusSlotProps,
  type TabsSlotProps,
  type TextareaSlotProps,
  type WysiwygSlotProps,
} from "../../core/adapter"
import { useUi } from "../../core/provider"
import { useRemoteOptions } from "../../core/remote"
import { TabPanel, useReveal } from "../../core/reveal"
import { useFormsTranslation } from "../../core/strings"
import { thaanaKeyDown } from "../../core/thaana"

/**
 * The HTML adapter renders plain, unstyled elements with `data-slot` attributes
 * to style them by. It is the fallback for every slot another adapter leaves
 * out, and the reference for writing your own (see `docs/advanced-usage/adapters.md`).
 */

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ") || undefined
}

/** Calls both handlers; the second is skipped when the first prevented the default. */
function compose<E extends React.SyntheticEvent>(first?: (e: E) => void, second?: (e: E) => void) {
  if (!first) return second
  if (!second) return first
  return (event: E) => {
    first(event)
    if (!event.defaultPrevented) second(event)
  }
}

/* -------------------------------------------------------------------------- */
/* Form scaffolding                                                           */
/* -------------------------------------------------------------------------- */

function Form({ processing: _processing, ...props }: FormSlotProps) {
  return <form data-slot="form" {...props} />
}

function Field({
  id,
  label,
  labelId,
  hideLabel,
  inline,
  help,
  helpId,
  errors,
  errorId,
  disabled,
  classNames,
  children,
}: FieldSlotProps) {
  const ui = useUi()
  return (
    <div
      data-slot="field"
      data-inline={inline || undefined}
      data-invalid={errors.length ? true : undefined}
      data-disabled={disabled || undefined}
      className={classNames?.group}
    >
      {label ? (
        <ui.Label
          id={labelId}
          htmlFor={id}
          className={cx(hideLabel && "sr-only", classNames?.label)}
          style={hideLabel ? SR_ONLY : undefined}
        >
          {label}
        </ui.Label>
      ) : null}
      <div data-slot="field-control" className={classNames?.control}>
        {children}
        {help ? <ui.HelpText id={helpId}>{help}</ui.HelpText> : null}
        {errors.length ? <ui.FieldErrors id={errorId} errors={errors} /> : null}
      </div>
    </div>
  )
}

const SR_ONLY: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
}

function Label({ required: _required, ...props }: LabelSlotProps) {
  return <label data-slot="label" {...props} />
}

function RequiredMarker({ symbol, className }: RequiredMarkerSlotProps) {
  return (
    <span data-slot="required-marker" aria-hidden="true" className={className}>
      {" "}
      {symbol}
    </span>
  )
}

function HelpText({ id, className, children }: HelpTextSlotProps) {
  return (
    <div data-slot="help-text" id={id} className={className}>
      {children}
    </div>
  )
}

function FieldErrors({ id, errors, className }: FieldErrorsSlotProps) {
  return (
    <div data-slot="field-errors" id={id} aria-live="polite" className={className}>
      {errors.map((message, i) => (
        <p key={`${i}-${message}`}>{message}</p>
      ))}
    </div>
  )
}

function ErrorSummary({ id, title, description, items, onSelect, className }: ErrorSummarySlotProps) {
  const titleId = React.useId()
  return (
    <div data-slot="error-summary" id={id} role="alert" aria-labelledby={titleId} className={className}>
      <p id={titleId} data-slot="error-summary-title">
        <strong>{title}</strong>
      </p>
      {description ? <p>{description}</p> : null}
      {items.length ? (
        <ul>
          {items.flatMap((item) =>
            item.messages.map((message, i) => (
              <li key={`${item.name}-${i}`}>
                <a
                  href={`#${item.name}`}
                  onClick={(event) => {
                    if (onSelect(item.name)) event.preventDefault()
                  }}
                >
                  {message}
                </a>
              </li>
            )),
          )}
        </ul>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                   */
/* -------------------------------------------------------------------------- */

function Addons({
  prepend,
  append,
  children,
}: {
  prepend?: React.ReactNode
  append?: React.ReactNode
  children: React.ReactNode
}) {
  if (!prepend && !append) return <>{children}</>
  return (
    <div data-slot="input-group">
      {prepend ? <span data-slot="input-prepend">{prepend}</span> : null}
      {children}
      {append ? <span data-slot="input-append">{append}</span> : null}
    </div>
  )
}

function Input({ prepend, append, thaana, thaanaToggle, onKeyDown, ...props }: InputSlotProps) {
  const { t } = useFormsTranslation()
  const [on, setOn] = React.useState(true)
  const typing = !!thaana && on
  return (
    <Addons
      prepend={prepend}
      append={
        thaana && thaanaToggle ? (
          <>
            <button type="button" aria-pressed={on} aria-label={t("thaana_toggle")} onClick={() => setOn((v) => !v)}>
              ތ
            </button>
            {append}
          </>
        ) : (
          append
        )
      }
    >
      <input
        data-slot="input"
        {...props}
        dir={props.dir ?? (typing ? "rtl" : undefined)}
        lang={props.lang ?? (typing ? "dv" : undefined)}
        onKeyDown={typing ? compose(onKeyDown, thaanaKeyDown) : onKeyDown}
      />
    </Addons>
  )
}

function Textarea({ autoResize, thaana, onKeyDown, onInput, ...props }: TextareaSlotProps) {
  const grow = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const el = event.currentTarget
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }
  return (
    <textarea
      data-slot="textarea"
      {...props}
      dir={props.dir ?? (thaana ? "rtl" : undefined)}
      lang={props.lang ?? (thaana ? "dv" : undefined)}
      onKeyDown={thaana ? compose(onKeyDown, thaanaKeyDown) : onKeyDown}
      onInput={autoResize ? compose(onInput, grow) : onInput}
    />
  )
}

function NumberInput({ value, onValueChange, decimals, prepend, append, ...props }: NumberSlotProps) {
  // Keep what is typed ("1.", "-") while it stands for the current value.
  const [state, setState] = React.useState({ text: value === null ? "" : String(value), value })
  if (state.value !== value) setState({ text: value === null ? "" : String(value), value })
  return (
    <Addons prepend={prepend} append={append}>
      <input
        data-slot="number"
        type="number"
        inputMode="decimal"
        dir="ltr"
        {...props}
        step={props.step ?? (decimals !== undefined ? 1 / 10 ** decimals : "any")}
        value={state.text}
        onChange={(event) => {
          const raw = event.target.value
          const n = raw === "" ? null : Number(raw)
          if (n !== null && !Number.isFinite(n)) {
            setState({ text: raw, value })
            return
          }
          const next = n === null || decimals === undefined ? n : Number(n.toFixed(decimals))
          setState({ text: raw, value: next })
          onValueChange(next)
        }}
      />
    </Addons>
  )
}

function Checkbox({ checked, onCheckedChange, label, className, ...props }: CheckboxSlotProps) {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = checked === "indeterminate"
  }, [checked])
  const input = (
    <input
      ref={ref}
      data-slot="checkbox"
      type="checkbox"
      {...props}
      name={props.name || undefined}
      checked={checked === true}
      onChange={(event) => onCheckedChange(event.target.checked)}
    />
  )
  if (!label) return <span className={className}>{input}</span>
  return (
    <label data-slot="checkbox-label" className={className}>
      {input} <span>{label}</span>
    </label>
  )
}

function Radio({ checked, onCheckedChange, label, className, ...props }: RadioSlotProps) {
  const input = (
    <input
      data-slot="radio"
      type="radio"
      {...props}
      checked={checked}
      onChange={(event) => onCheckedChange(event.target.checked)}
    />
  )
  if (!label) return <span className={className}>{input}</span>
  return (
    <label data-slot="radio-label" className={className}>
      {input} <span>{label}</span>
    </label>
  )
}

function Select({
  options,
  value,
  onValueChange,
  multiple,
  searchable,
  clearable,
  creatable,
  placeholder,
  loading,
  remote,
  className,
  ...props
}: SelectSlotProps) {
  const { t } = useFormsTranslation()
  const [query, setQuery] = React.useState("")
  const found = useRemoteOptions(remote, query)
  const base = remote
    ? [...options, ...found.options.filter((o) => !options.some((x) => x.value === o.value))]
    : options
  const known = new Set(base.map((o) => o.value))
  const all: SelectOption[] = [...base, ...value.filter((v) => !known.has(v)).map((v) => ({ value: v, label: v }))]
  const q = query.trim().toLowerCase()
  const shown =
    searchable && !remote && q ? all.filter((o) => value.includes(o.value) || o.label.toLowerCase().includes(q)) : all
  const searchId = props.id ? `${props.id}-search` : undefined

  const select = (
    <select
      data-slot="select"
      {...props}
      className={searchable || creatable || remote ? undefined : className}
      multiple={multiple}
      aria-busy={loading || found.loading || undefined}
      value={multiple ? value : (value[0] ?? "")}
      onChange={(event) => {
        const next = multiple
          ? Array.from(event.target.selectedOptions, (o) => o.value)
          : event.target.value
            ? [event.target.value]
            : []
        onValueChange(next)
      }}
    >
      {!multiple && (placeholder || clearable || !value.length) ? (
        <option value="" disabled={!clearable && !!props.required && !!value.length}>
          {placeholder ?? ""}
        </option>
      ) : null}
      {shown.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  )

  if (!searchable && !creatable && !remote) return select

  return (
    <div data-slot="select-search" className={className}>
      <input
        type="search"
        id={searchId}
        aria-label={t("search")}
        aria-controls={props.id}
        disabled={props.disabled}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return
          event.preventDefault()
          const text = query.trim()
          if (!text) return
          const match = shown.find((o) => o.label.toLowerCase() === text.toLowerCase()) ?? (creatable ? null : shown[0])
          const picked = match ? match.value : creatable ? text : null
          if (picked === null) return
          onValueChange(multiple ? [...value.filter((v) => v !== picked), picked] : [picked])
          setQuery("")
        }}
      />
      {select}
    </div>
  )
}

const DATE_TYPES = { date: "date", datetime: "datetime-local", time: "time" } as const

/** `yyyy-MM-dd HH:mm:ss` ⇄ the `datetime-local` value `yyyy-MM-ddTHH:mm:ss`. */
function toNative(value: string, mode: DateSlotProps["mode"]) {
  return mode === "datetime" ? value.replace(" ", "T") : value
}

function fromNative(value: string, mode: DateSlotProps["mode"]) {
  if (mode !== "datetime" || !value) return value
  const [date, time = "00:00"] = value.split("T")
  return `${date} ${time.length === 5 ? `${time}:00` : time}`
}

function DateInput({ mode, value, onValueChange, name, min, max, ...props }: DateSlotProps) {
  return (
    <>
      <input
        data-slot="date"
        type={DATE_TYPES[mode]}
        dir="ltr"
        step={mode === "datetime" ? 1 : undefined}
        {...props}
        min={min === undefined ? undefined : toNative(min, mode)}
        max={max === undefined ? undefined : toNative(max, mode)}
        value={toNative(value, mode)}
        onChange={(event) => onValueChange(fromNative(event.target.value, mode))}
      />
      {/* The visible input's format varies by browser; this one submits the Laravel format. */}
      <input type="hidden" name={name} value={value} disabled={props.disabled} />
    </>
  )
}

function FileInput({
  onFilesChange,
  buttonLabel,
  placeholder,
  showList,
  maxSize: _maxSize,
  className,
  ...props
}: FileSlotProps) {
  const [names, setNames] = React.useState<string[]>([])
  return (
    <span data-slot="file" className={className}>
      <input
        type="file"
        {...props}
        name={props.name || undefined}
        aria-label={buttonLabel}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          setNames(files.map((f) => f.name))
          onFilesChange(files)
        }}
      />
      {showList ? <span data-slot="file-list">{names.length ? names.join(", ") : placeholder}</span> : null}
    </span>
  )
}

function useObjectUrl(value: File | string | null) {
  const objectUrl = React.useMemo(
    () =>
      value && typeof value !== "string" && typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(value)
        : null,
    [value],
  )
  React.useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    },
    [objectUrl],
  )
  return typeof value === "string" ? value : objectUrl
}

function ImageInput({
  value,
  onValueChange,
  alt,
  shape,
  aspectRatio,
  cover,
  fullWidth,
  placeholder,
  maxSize: _maxSize,
  className,
  ...props
}: ImageSlotProps) {
  const { t } = useFormsTranslation()
  const url = useObjectUrl(value)
  const ref = React.useRef<HTMLInputElement>(null)
  return (
    <span data-slot="image" data-shape={shape} data-full-width={fullWidth || undefined} className={className}>
      <span
        data-slot="image-preview"
        style={{ display: "block", aspectRatio: String(aspectRatio), maxWidth: fullWidth ? undefined : "16rem" }}
      >
        {url ? (
          <img
            src={url}
            alt={alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: cover ? "cover" : "contain",
              borderRadius: shape === "circle" ? "50%" : undefined,
            }}
          />
        ) : (
          placeholder
        )}
      </span>
      <input
        ref={ref}
        type="file"
        {...props}
        name={props.name || undefined}
        aria-label={alt}
        onChange={(event) => onValueChange(event.target.files?.[0] ?? null)}
      />
      {value && !props.disabled ? (
        <button
          type="button"
          onClick={() => {
            if (ref.current) ref.current.value = ""
            onValueChange(null)
          }}
        >
          {t("fileinput_remove_file")}
        </button>
      ) : null}
    </span>
  )
}

function Wysiwyg({ value, onValueChange, ...props }: WysiwygSlotProps) {
  return (
    <textarea data-slot="wysiwyg" rows={8} {...props} value={value} onChange={(e) => onValueChange(e.target.value)} />
  )
}

/** No map without a map library: `MapInput` still shows its coordinate fields. */
function MapPlaceholder() {
  return null
}

/* -------------------------------------------------------------------------- */
/* Buttons, links, icons                                                      */
/* -------------------------------------------------------------------------- */

const ICON_PATHS: Record<IconName, string> = {
  download: "M12 3v12m0 0-4-4m4 4 4-4M5 21h14",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  error: "M12 8v5m0 3h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
  "chevron-up": "m6 15 6-6 6 6",
  "chevron-down": "m6 9 6 6 6-6",
  "chevron-left": "m15 6-6 6 6 6",
  "chevron-right": "m9 6 6 6-6 6",
  "chevrons-up-down": "m7 15 5 5 5-5M7 9l5-5 5 5",
}

function Icon({ name, size = "md", className }: IconSlotProps) {
  const { direction } = useFormsTranslation()
  const px = size === "sm" ? 14 : 16
  // Arrows that point to a side follow the reading direction.
  const flip = (name === "chevron-left" || name === "chevron-right") && direction === "rtl"
  return (
    <svg
      data-slot="icon"
      data-icon={name}
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-flipped={flip || undefined}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      className={className}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  )
}

function ButtonContent({
  startIcon,
  endIcon,
  loading,
  children,
}: Pick<ButtonSlotProps, "startIcon" | "endIcon" | "loading" | "children">) {
  const ui = useUi()
  return (
    <>
      {loading ? <span data-slot="spinner" aria-hidden="true" /> : startIcon ? <ui.Icon name={startIcon} /> : null}
      {children}
      {endIcon ? <ui.Icon name={endIcon} /> : null}
    </>
  )
}

function Button({ color, size, loading, startIcon, endIcon, children, disabled, ...props }: ButtonSlotProps) {
  return (
    <button
      data-slot="button"
      data-color={color}
      data-size={size}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      <ButtonContent startIcon={startIcon} endIcon={endIcon} loading={loading}>
        {children}
      </ButtonContent>
    </button>
  )
}

function Link(props: LinkSlotProps) {
  return <a data-slot="link" {...props} />
}

function LinkButton({ color, size, disabled, startIcon, endIcon, children, href, ...props }: LinkButtonSlotProps) {
  const ui = useUi()
  return (
    <ui.Link
      data-slot="link-button"
      data-color={color}
      data-size={size}
      href={disabled ? undefined! : href}
      aria-disabled={disabled || undefined}
      {...props}
    >
      <ButtonContent startIcon={startIcon} endIcon={endIcon}>
        {children}
      </ButtonContent>
    </ui.Link>
  )
}

function ButtonGroup({ orientation, className, children }: ButtonGroupSlotProps) {
  return (
    <div data-slot="button-group" role="group" data-orientation={orientation} className={className}>
      {children}
    </div>
  )
}

function ActionMenu({ label, items }: ActionMenuSlotProps) {
  const ref = React.useRef<HTMLDetailsElement>(null)
  return (
    <details data-slot="action-menu" ref={ref}>
      <summary aria-label={label}>▾</summary>
      <ul role="menu">
        {items.map((item, i) => (
          <li key={i} role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                if (ref.current) ref.current.open = false
                item.onSelect()
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </details>
  )
}

/* -------------------------------------------------------------------------- */
/* Display                                                                    */
/* -------------------------------------------------------------------------- */

function Alert({ type, heading, icon, dismissible, className, children }: AlertSlotProps) {
  const ui = useUi()
  const { t } = useFormsTranslation()
  const [open, setOpen] = React.useState(true)
  if (!open) return null
  return (
    <div data-slot="alert" data-type={type} role={type === "danger" ? "alert" : "status"} className={className}>
      {icon ? <span data-slot="alert-icon">{icon}</span> : null}
      <div>
        {heading ? <p data-slot="alert-heading">{heading}</p> : null}
        {children}
      </div>
      {dismissible ? (
        <button type="button" aria-label={t("close")} onClick={() => setOpen(false)}>
          <ui.Icon name="close" />
        </button>
      ) : null}
    </div>
  )
}

function Card({ title, subtitle, footer, imageTop, className, children }: CardSlotProps) {
  const ui = useUi()
  const composed = title || subtitle || footer !== undefined || imageTop
  if (!composed) {
    return (
      <div data-slot="card" className={className}>
        {children}
      </div>
    )
  }
  return (
    <div data-slot="card" className={className}>
      {imageTop}
      {title || subtitle ? (
        <ui.CardHeader>
          {title ? <ui.CardTitle>{title}</ui.CardTitle> : null}
          {subtitle ? <ui.CardSubtitle>{subtitle}</ui.CardSubtitle> : null}
        </ui.CardHeader>
      ) : null}
      <div data-slot="card-content">{children}</div>
      {footer !== undefined ? <ui.CardFooter>{footer}</ui.CardFooter> : null}
    </div>
  )
}

const cardPart = (slot: string) =>
  function CardPart(props: React.ComponentProps<"div">) {
    return <div data-slot={slot} {...props} />
  }

function AccordionBody({ id, onReveal, children }: { id: string; onReveal: () => void; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  useReveal(ref, onReveal)
  return (
    <div ref={ref} id={id}>
      {children}
    </div>
  )
}

function Accordion({ id, items, defaultValue, multiple, className }: AccordionSlotProps) {
  const [open, setOpen] = React.useState<string[]>(defaultValue)
  return (
    <div data-slot="accordion" id={id} className={className}>
      {items.map((item) => (
        <details
          key={item.value}
          id={item.id}
          open={open.includes(item.value)}
          onToggle={(event) => {
            const isOpen = (event.currentTarget as HTMLDetailsElement).open
            setOpen((current) => {
              if (isOpen === current.includes(item.value)) return current
              if (!isOpen) return current.filter((v) => v !== item.value)
              return multiple ? [...current, item.value] : [item.value]
            })
          }}
        >
          <summary aria-disabled={item.disabled || undefined}>{item.title}</summary>
          <AccordionBody
            id={item.value}
            onReveal={() =>
              setOpen((current) =>
                current.includes(item.value) ? current : multiple ? [...current, item.value] : [item.value],
              )
            }
          >
            {item.content}
          </AccordionBody>
        </details>
      ))}
    </div>
  )
}

function Tabs({ items, defaultValue, onValueChange, className }: TabsSlotProps) {
  const [active, setActive] = React.useState(defaultValue)
  const baseId = React.useId()
  const select = (value: string) => {
    setActive(value)
    onValueChange(value)
  }
  return (
    <div data-slot="tabs" className={className}>
      <div role="tablist">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={`${baseId}-${item.value}-tab`}
            aria-controls={`${baseId}-${item.value}`}
            aria-selected={active === item.value}
            disabled={item.disabled}
            onClick={() => select(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <TabPanel
          key={item.value}
          id={`${baseId}-${item.value}`}
          aria-labelledby={`${baseId}-${item.value}-tab`}
          active={active === item.value}
          onReveal={() => select(item.value)}
        >
          {item.content}
        </TabPanel>
      ))}
    </div>
  )
}

function NavTabs({ items, className }: NavTabsSlotProps) {
  const ui = useUi()
  return (
    <nav data-slot="nav-tabs" className={className}>
      <ul>
        {items.map((item, i) => (
          <li key={i}>
            <ui.Link
              href={item.disabled ? undefined! : item.href}
              aria-current={item.active ? "page" : undefined}
              aria-disabled={item.disabled || undefined}
            >
              {item.icon}
              {item.label}
            </ui.Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Modal({
  id,
  open: openProp,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  size,
  className,
  children,
}: ModalSlotProps) {
  const ui = useUi()
  const { t } = useFormsTranslation()
  const ref = React.useRef<HTMLDialogElement>(null)
  const [own, setOwn] = React.useState(!!defaultOpen)
  const open = openProp ?? own
  const titleId = React.useId()
  const setOpen = (next: boolean) => {
    setOwn(next)
    onOpenChange?.(next)
  }

  React.useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal()
      else dialog.setAttribute("open", "")
    } else if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close()
      else dialog.removeAttribute("open")
    }
  }, [open])

  return (
    <>
      {trigger
        ? React.cloneElement(trigger as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
            onClick: (event: React.MouseEvent) => {
              ;(trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(event)
              setOpen(true)
            },
          })
        : null}
      <dialog
        ref={ref}
        id={id}
        data-slot="modal"
        data-size={size}
        aria-labelledby={title ? titleId : undefined}
        className={className}
        onClose={() => {
          if (open) setOpen(false)
        }}
      >
        <div data-slot="modal-header">
          {title ? <h2 id={titleId}>{title}</h2> : null}
          <button type="button" aria-label={t("close")} onClick={() => setOpen(false)}>
            <ui.Icon name="close" />
          </button>
        </div>
        {description ? <p>{description}</p> : null}
        <div data-slot="modal-body">{children}</div>
        {footer ? <div data-slot="modal-footer">{footer}</div> : null}
      </dialog>
    </>
  )
}

function Status({ tone, className, children }: StatusSlotProps) {
  return (
    <span data-slot="status" data-tone={tone} className={className}>
      {children}
    </span>
  )
}

function DescriptionList({ layout, className, children }: DescriptionListSlotProps) {
  return (
    <dl data-slot="description-list" data-layout={layout} className={className}>
      {children}
    </dl>
  )
}

function DescriptionItem({ label, classNames, className, children }: DescriptionItemSlotProps) {
  return (
    <div data-slot="description-item" className={className}>
      {label !== null && label !== undefined && label !== "" ? <dt className={classNames?.label}>{label}</dt> : null}
      <dd className={classNames?.value}>{children}</dd>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Listing                                                                    */
/* -------------------------------------------------------------------------- */

function Table(props: React.ComponentProps<"table">) {
  return <table data-slot="table" {...props} />
}

function EmptyState({ icon, title, description, action, className }: EmptyStateSlotProps) {
  return (
    <div data-slot="empty-state" className={className}>
      {icon ? <div data-slot="empty-state-icon">{icon}</div> : null}
      <p data-slot="empty-state-title">
        <strong>{title}</strong>
      </p>
      {description ? <p>{description}</p> : null}
      {action ? <div data-slot="empty-state-action">{action}</div> : null}
    </div>
  )
}

/** Page numbers around the current page, with gaps (`null`) for the rest. */
export function pageWindow(current: number, last: number, around = 1): Array<number | null> {
  const pages: Array<number | null> = []
  for (let page = 1; page <= last; page++) {
    if (page === 1 || page === last || Math.abs(page - current) <= around) pages.push(page)
    else if (pages.at(-1) !== null) pages.push(null)
  }
  return pages
}

function Pagination({ currentPage, lastPage, hrefFor, onPageChange, className }: PaginationSlotProps) {
  const ui = useUi()
  const { t } = useFormsTranslation()
  if (lastPage <= 1) return null

  const item = (page: number, content: React.ReactNode, label: string, disabled = false, current = false) => {
    if (disabled) return <span aria-disabled="true">{content}</span>
    if (hrefFor) {
      return (
        <ui.Link href={hrefFor(page)} aria-label={label} aria-current={current ? "page" : undefined}>
          {content}
        </ui.Link>
      )
    }
    return (
      <button
        type="button"
        aria-label={label}
        aria-current={current ? "page" : undefined}
        onClick={() => onPageChange?.(page)}
      >
        {content}
      </button>
    )
  }

  return (
    <nav data-slot="pagination" aria-label={t("pagination")} className={className}>
      <ul>
        <li>{item(currentPage - 1, <ui.Icon name="chevron-left" />, t("previous"), currentPage <= 1)}</li>
        {pageWindow(currentPage, lastPage).map((page, i) => (
          <li key={page ?? `gap-${i}`}>
            {page === null ? "…" : item(page, page, t("page", { page }), false, page === currentPage)}
          </li>
        ))}
        <li>{item(currentPage + 1, <ui.Icon name="chevron-right" />, t("next"), currentPage >= lastPage)}</li>
      </ul>
    </nav>
  )
}

const element = <T extends keyof React.JSX.IntrinsicElements>(tag: T, slot: string) =>
  function Element(props: React.ComponentProps<T>) {
    return React.createElement(tag, { "data-slot": slot, ...props })
  }

/** Plain HTML for every slot. */
export const html = defineAdapter({
  name: "html",
  components: {
    Form,
    Field,
    Label,
    RequiredMarker,
    HelpText,
    FieldErrors,
    ErrorSummary,
    Input,
    Textarea,
    Number: NumberInput,
    Checkbox,
    Radio,
    Select,
    Date: DateInput,
    File: FileInput,
    Image: ImageInput,
    Wysiwyg,
    Map: MapPlaceholder,
    Button,
    Link,
    LinkButton,
    ButtonGroup,
    Icon,
    ActionMenu,
    Alert,
    Card,
    CardHeader: cardPart("card-header"),
    CardTitle: cardPart("card-title"),
    CardSubtitle: cardPart("card-subtitle"),
    CardFooter: cardPart("card-footer"),
    Accordion,
    Tabs,
    NavTabs,
    Modal,
    Status,
    DescriptionList,
    DescriptionItem,
    Table,
    TableHeader: element("thead", "table-header"),
    TableBody: element("tbody", "table-body"),
    TableRow: element("tr", "table-row"),
    TableHead: element("th", "table-head"),
    TableCell: element("td", "table-cell"),
    EmptyState,
    Pagination,
  },
})
