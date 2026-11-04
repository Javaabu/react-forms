"use client"

import * as React from "react"

import {
  defineAdapter,
  type AccordionSlotProps,
  type ActionMenuSlotProps,
  type AlertSlotProps,
  type ButtonColor,
  type ButtonSlotProps,
  type CardSlotProps,
  type CheckboxSlotProps,
  type DateSlotProps,
  type ErrorSummarySlotProps,
  type FieldSlotProps,
  type FileSlotProps,
  type FormsAdapter,
  type FormsComponents,
  type InputSlotProps,
  type LabelSlotProps,
  type LinkButtonSlotProps,
  type ModalSlotProps,
  type NumberSlotProps,
  type RadioSlotProps,
  type SelectOption,
  type SelectSlotProps,
  type StatusSlotProps,
  type StatusTone,
  type TabsSlotProps,
  type TextareaSlotProps,
} from "../../core/adapter"
import { useUi } from "../../core/provider"
import { useRemoteOptions } from "../../core/remote"
import { useFormsTranslation } from "../../core/strings"
import { thaanaKeyDown } from "../../core/thaana"
import { html } from "../html"

// shadcn components are the app's own, so their props aren't known here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Component = React.ComponentType<any>

/**
 * The shadcn/ui components the adapter uses, by their shadcn names. Pass the ones
 * your app has (`npx shadcn add …`); a slot whose components are missing renders
 * with the HTML adapter.
 *
 * | Components | Slots |
 * | --- | --- |
 * | `Button` | `Button`, `LinkButton` |
 * | `Input` | `Input`, `Number`, `Date`, `File` |
 * | `Textarea` | `Textarea` |
 * | `Label` | `Label`, and the labels of `Field`, `Checkbox`, `Radio` |
 * | `Field`, `FieldLabel`, `FieldDescription`, `FieldError` | `Field` |
 * | `Checkbox` | `Checkbox` |
 * | `RadioGroup`, `RadioGroupItem` | `Radio` |
 * | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` | `Select` (single, without search) |
 * | `Popover`, `PopoverTrigger`, `PopoverContent`, `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem` | `Select` (searchable, multiple, tags, server search) |
 * | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `Card` and its parts |
 * | `Alert`, `AlertTitle`, `AlertDescription` | `Alert`, `ErrorSummary` |
 * | `Badge` | `Status` |
 * | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | the table slots |
 * | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `Tabs` |
 * | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | `Accordion` |
 * | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` | `Modal` |
 * | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` | `ActionMenu` |
 */
export interface ShadcnComponents {
  Button?: Component
  Input?: Component
  Textarea?: Component
  Label?: Component
  Field?: Component
  FieldLabel?: Component
  FieldDescription?: Component
  FieldError?: Component
  Checkbox?: Component
  RadioGroup?: Component
  RadioGroupItem?: Component
  Select?: Component
  SelectTrigger?: Component
  SelectValue?: Component
  SelectContent?: Component
  SelectItem?: Component
  Popover?: Component
  PopoverTrigger?: Component
  PopoverContent?: Component
  Command?: Component
  CommandInput?: Component
  CommandList?: Component
  CommandEmpty?: Component
  CommandGroup?: Component
  CommandItem?: Component
  Card?: Component
  CardHeader?: Component
  CardTitle?: Component
  CardDescription?: Component
  CardContent?: Component
  CardFooter?: Component
  Alert?: Component
  AlertTitle?: Component
  AlertDescription?: Component
  Badge?: Component
  Table?: Component
  TableHeader?: Component
  TableBody?: Component
  TableRow?: Component
  TableHead?: Component
  TableCell?: Component
  Tabs?: Component
  TabsList?: Component
  TabsTrigger?: Component
  TabsContent?: Component
  Accordion?: Component
  AccordionItem?: Component
  AccordionTrigger?: Component
  AccordionContent?: Component
  Dialog?: Component
  DialogTrigger?: Component
  DialogContent?: Component
  DialogHeader?: Component
  DialogTitle?: Component
  DialogDescription?: Component
  DialogFooter?: Component
  DropdownMenu?: Component
  DropdownMenuTrigger?: Component
  DropdownMenuContent?: Component
  DropdownMenuItem?: Component
}

export interface ShadcnAdapterOptions extends Partial<Pick<FormsAdapter, "confirm" | "notify">> {
  /** Adapter name. Default `shadcn`. */
  name?: string
}

type Required<K extends keyof ShadcnComponents> = { [P in K]-?: NonNullable<ShadcnComponents[P]> }

function has<K extends keyof ShadcnComponents>(c: ShadcnComponents, keys: K[]): c is ShadcnComponents & Required<K> {
  return keys.every((key) => !!c[key])
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ") || undefined
}

/** shadcn button variants for Blade colours. */
export function colorToShadcnVariant(color: ButtonColor | string | undefined): string {
  if (!color) return "default"
  if (color.startsWith("outline-") || color === "light") return "outline"
  if (color === "danger") return "destructive"
  if (color === "secondary" || color === "dark") return "secondary"
  if (color === "link") return "link"
  return "default"
}

const SIZES = { sm: "sm", md: "default", lg: "lg", icon: "icon" } as const

const BADGE_VARIANTS: Record<StatusTone, string> = {
  success: "default",
  info: "secondary",
  warning: "outline",
  danger: "destructive",
  neutral: "secondary",
}

function Spinner() {
  return (
    <span
      data-slot="spinner"
      aria-hidden="true"
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  )
}

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
    <div data-slot="input-group" className="flex items-center gap-2">
      {prepend ? <span className="shrink-0 text-sm text-muted-foreground">{prepend}</span> : null}
      <div className="min-w-0 flex-1">{children}</div>
      {append ? <span className="shrink-0 text-sm text-muted-foreground">{append}</span> : null}
    </div>
  )
}

/** Hidden inputs for a value list, for selects whose widget isn't a native control. */
function HiddenValues({
  name,
  values,
  multiple,
  disabled,
}: {
  name: string
  values: string[]
  multiple: boolean
  disabled?: boolean
}) {
  if (!name) return null
  if (!multiple) return <input type="hidden" name={name} value={values[0] ?? ""} disabled={disabled} />
  return (
    <>
      {values.map((v) => (
        <input key={v} type="hidden" name={name} value={v} disabled={disabled} />
      ))}
    </>
  )
}

/**
 * Makes an adapter from your app's shadcn/ui components:
 *
 * ```tsx
 * import { Button } from "@/components/ui/button"
 * import { Input } from "@/components/ui/input"
 * import { Label } from "@/components/ui/label"
 * import { createShadcnAdapter } from "@javaabu/forms/shadcn"
 *
 * export const shadcn = createShadcnAdapter({ Button, Input, Label })
 * ```
 */
export function createShadcnAdapter(c: ShadcnComponents, options: ShadcnAdapterOptions = {}): FormsAdapter {
  const components: Partial<FormsComponents> = {}
  const Fallback = html.components

  if (c.Label) {
    const L = c.Label
    components.Label = function ShadcnLabel({ required: _required, ...props }: LabelSlotProps) {
      return <L {...props} />
    }
  }

  if (has(c, ["Field", "FieldLabel"]) || c.Label) {
    components.Field = function ShadcnField({
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
      const FieldRoot = c.Field
      const FieldLabel = c.FieldLabel ?? c.Label!
      const labelNode = label ? (
        <FieldLabel id={labelId} htmlFor={id} className={cx(hideLabel && "sr-only", classNames?.label)}>
          {label}
        </FieldLabel>
      ) : null
      const helpNode = help ? (
        c.FieldDescription ? (
          <c.FieldDescription id={helpId}>{help}</c.FieldDescription>
        ) : (
          <p id={helpId} className="text-sm text-muted-foreground">
            {help}
          </p>
        )
      ) : null
      const errorNode = errors.length ? (
        c.FieldError ? (
          <c.FieldError id={errorId} errors={errors.map((message) => ({ message }))} />
        ) : (
          <div id={errorId} role="alert" className="text-sm text-destructive">
            {errors.map((m) => (
              <p key={m}>{m}</p>
            ))}
          </div>
        )
      ) : null
      const body = (
        <>
          {labelNode}
          <div className={cx("grid gap-2", classNames?.control)}>
            {children}
            {helpNode}
            {errorNode}
          </div>
        </>
      )
      if (FieldRoot) {
        return (
          <FieldRoot
            data-invalid={errors.length ? true : undefined}
            data-disabled={disabled || undefined}
            orientation={inline ? "responsive" : "vertical"}
            className={classNames?.group}
          >
            {body}
          </FieldRoot>
        )
      }
      return (
        <div
          data-slot="field"
          data-invalid={errors.length ? true : undefined}
          className={cx("grid gap-2", classNames?.group)}
        >
          {body}
        </div>
      )
    }
  }

  if (c.Input) {
    const I = c.Input
    components.Input = function ShadcnInput({
      prepend,
      append,
      thaana,
      thaanaToggle: _toggle,
      onKeyDown,
      ...props
    }: InputSlotProps) {
      return (
        <Addons prepend={prepend} append={append}>
          <I
            {...props}
            dir={props.dir ?? (thaana ? "rtl" : undefined)}
            lang={props.lang ?? (thaana ? "dv" : undefined)}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              onKeyDown?.(event)
              if (thaana && !event.defaultPrevented) thaanaKeyDown(event)
            }}
          />
        </Addons>
      )
    }

    components.Number = function ShadcnNumber({
      value,
      onValueChange,
      decimals,
      prepend,
      append,
      ...props
    }: NumberSlotProps) {
      const [state, setState] = React.useState({ text: value === null ? "" : String(value), value })
      if (state.value !== value) setState({ text: value === null ? "" : String(value), value })
      return (
        <Addons prepend={prepend} append={append}>
          <I
            type="number"
            inputMode="decimal"
            dir="ltr"
            {...props}
            step={props.step ?? (decimals !== undefined ? 1 / 10 ** decimals : "any")}
            value={state.text}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const raw = event.target.value
              const n = raw === "" ? null : Number(raw)
              if (n !== null && !Number.isFinite(n)) return setState({ text: raw, value })
              const next = n === null || decimals === undefined ? n : Number(n.toFixed(decimals))
              setState({ text: raw, value: next })
              onValueChange(next)
            }}
          />
        </Addons>
      )
    }

    const TYPES = { date: "date", datetime: "datetime-local", time: "time" } as const
    components.Date = function ShadcnDate({ mode, value, onValueChange, name, min, max, ...props }: DateSlotProps) {
      const toNative = (v: string) => (mode === "datetime" ? v.replace(" ", "T") : v)
      const fromNative = (v: string) => {
        if (mode !== "datetime" || !v) return v
        const [date, time = "00:00"] = v.split("T")
        return `${date} ${time.length === 5 ? `${time}:00` : time}`
      }
      return (
        <>
          <I
            type={TYPES[mode]}
            dir="ltr"
            step={mode === "datetime" ? 1 : undefined}
            {...props}
            min={min === undefined ? undefined : toNative(min)}
            max={max === undefined ? undefined : toNative(max)}
            value={toNative(value)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onValueChange(fromNative(event.target.value))}
          />
          <input type="hidden" name={name} value={value} disabled={props.disabled} />
        </>
      )
    }

    components.File = function ShadcnFile({
      onFilesChange,
      buttonLabel,
      placeholder: _placeholder,
      showList: _showList,
      maxSize: _maxSize,
      name,
      ...props
    }: FileSlotProps) {
      return (
        <I
          type="file"
          {...props}
          name={name || undefined}
          aria-label={buttonLabel}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => onFilesChange(Array.from(event.target.files ?? []))}
        />
      )
    }
  }

  if (c.Textarea) {
    const T = c.Textarea
    components.Textarea = function ShadcnTextarea({ autoResize, thaana, onKeyDown, ...props }: TextareaSlotProps) {
      return (
        <T
          {...props}
          // shadcn's textarea grows with its content (`field-sizing-content`) unless it has rows.
          className={cx(!autoResize && "field-sizing-fixed", props.className)}
          dir={props.dir ?? (thaana ? "rtl" : undefined)}
          lang={props.lang ?? (thaana ? "dv" : undefined)}
          onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            onKeyDown?.(event)
            if (thaana && !event.defaultPrevented) thaanaKeyDown(event)
          }}
        />
      )
    }
  }

  const BesideLabel = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) =>
    c.Label ? (
      <c.Label htmlFor={htmlFor}>{children}</c.Label>
    ) : (
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {children}
      </label>
    )

  if (c.Checkbox) {
    const Box = c.Checkbox
    components.Checkbox = function ShadcnCheckbox({
      checked,
      onCheckedChange,
      label,
      className,
      ...props
    }: CheckboxSlotProps) {
      return (
        <div data-slot="checkbox-field" className={cx("flex items-center gap-2", className)}>
          <Box
            {...props}
            name={props.name || undefined}
            checked={checked}
            onCheckedChange={(state: boolean | "indeterminate") => onCheckedChange(state === true)}
          />
          {label ? <BesideLabel htmlFor={props.id}>{label}</BesideLabel> : null}
        </div>
      )
    }
  }

  if (has(c, ["RadioGroup", "RadioGroupItem"])) {
    const { RadioGroup, RadioGroupItem } = c
    // Each radio has its own group (the core tracks the selection), named so the form submits it.
    components.Radio = function ShadcnRadio({
      checked,
      onCheckedChange,
      label,
      className,
      name,
      value,
      required,
      disabled,
      ...props
    }: RadioSlotProps) {
      return (
        <RadioGroup
          name={name}
          value={checked ? value : ""}
          required={required}
          disabled={disabled}
          onValueChange={(v: string) => onCheckedChange(v === value)}
          className={cx("flex items-center gap-2", className)}
        >
          <RadioGroupItem {...props} value={value} />
          {label ? <BesideLabel htmlFor={props.id}>{label}</BesideLabel> : null}
        </RadioGroup>
      )
    }
  }

  const simpleSelect = has(c, ["Select", "SelectTrigger", "SelectValue", "SelectContent", "SelectItem"])
  const combobox = has(c, [
    "Popover",
    "PopoverTrigger",
    "PopoverContent",
    "Command",
    "CommandInput",
    "CommandList",
    "CommandEmpty",
    "CommandGroup",
    "CommandItem",
  ])

  if (simpleSelect || combobox) {
    function Combobox(props: SelectSlotProps) {
      const {
        options,
        value,
        onValueChange,
        multiple,
        creatable,
        placeholder,
        loading,
        remote,
        name,
        id,
        disabled,
        className,
      } = props
      const { t } = useFormsTranslation()
      const [open, setOpen] = React.useState(false)
      const [query, setQuery] = React.useState("")
      const found = useRemoteOptions(remote, query)
      const all: SelectOption[] = [...options]
      for (const o of found.options) if (!all.some((x) => x.value === o.value)) all.push(o)
      for (const v of value) if (!all.some((x) => x.value === v)) all.push({ value: v, label: v })
      const labels = value.map((v) => all.find((o) => o.value === v)?.label ?? v)
      const toggle = (v: string) => {
        if (multiple) onValueChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
        else {
          onValueChange(value[0] === v && props.clearable ? [] : [v])
          setOpen(false)
        }
        setQuery("")
      }
      const text = query.trim()
      const canCreate = creatable && text && !all.some((o) => o.label.toLowerCase() === text.toLowerCase())
      const trigger = (
        <button
          type="button"
          role="combobox"
          id={id}
          aria-expanded={open}
          aria-invalid={props["aria-invalid"]}
          aria-describedby={props["aria-describedby"]}
          aria-required={props.required}
          disabled={disabled}
          className={cx(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 text-start text-sm shadow-xs aria-invalid:border-destructive",
            className,
          )}
        >
          <span className={cx("truncate", !labels.length && "text-muted-foreground")}>
            {labels.length ? labels.join(", ") : (placeholder ?? "")}
          </span>
        </button>
      )
      const {
        Popover,
        PopoverTrigger,
        PopoverContent,
        Command,
        CommandInput,
        CommandList,
        CommandEmpty,
        CommandGroup,
        CommandItem,
      } = c as Required<
        | "Popover"
        | "PopoverTrigger"
        | "PopoverContent"
        | "Command"
        | "CommandInput"
        | "CommandList"
        | "CommandEmpty"
        | "CommandGroup"
        | "CommandItem"
      >
      return (
        <>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command shouldFilter={!remote}>
                <CommandInput placeholder={t("search")} value={query} onValueChange={setQuery} />
                <CommandList>
                  <CommandEmpty>{loading || found.loading ? t("loading") : t("blank")}</CommandEmpty>
                  <CommandGroup>
                    {all.map((o) => (
                      <CommandItem
                        key={o.value}
                        value={`${o.label} ${o.value}`}
                        disabled={o.disabled}
                        data-checked={value.includes(o.value) || undefined}
                        aria-selected={value.includes(o.value)}
                        onSelect={() => toggle(o.value)}
                      >
                        {o.label}
                      </CommandItem>
                    ))}
                    {canCreate ? (
                      <CommandItem value={`create ${text}`} onSelect={() => toggle(text)}>
                        {t("add_option", { value: text })}
                      </CommandItem>
                    ) : null}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <HiddenValues name={name} values={value} multiple={multiple} disabled={disabled} />
        </>
      )
    }

    components.Select = function ShadcnSelect(props: SelectSlotProps) {
      const needsCombobox = props.multiple || props.searchable || props.creatable || !!props.remote
      if (needsCombobox) return combobox ? <Combobox {...props} /> : <Fallback.Select {...props} />
      if (!simpleSelect) return combobox ? <Combobox {...props} /> : <Fallback.Select {...props} />
      const { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } = c as Required<
        "Select" | "SelectTrigger" | "SelectValue" | "SelectContent" | "SelectItem"
      >
      const { options, value, onValueChange, placeholder, name, id, disabled, required, className } = props
      return (
        <Select
          name={name}
          value={value[0] ?? ""}
          onValueChange={(v: string) => onValueChange(v ? [v] : [])}
          disabled={disabled}
          required={required}
        >
          <SelectTrigger
            id={id}
            className={cx("w-full", className)}
            aria-invalid={props["aria-invalid"]}
            aria-describedby={props["aria-describedby"]}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {/* Radix can't select an empty value. */}
            {options
              .filter((o) => o.value !== "")
              .map((o) => (
                <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )
    }
  }

  if (c.Button) {
    const B = c.Button
    components.Button = function ShadcnButton({
      color,
      size,
      loading,
      startIcon,
      endIcon,
      children,
      disabled,
      ...props
    }: ButtonSlotProps) {
      const ui = useUi()
      return (
        <B
          {...props}
          variant={colorToShadcnVariant(color)}
          size={size ? SIZES[size] : undefined}
          disabled={disabled || loading}
          aria-busy={loading || undefined}
        >
          {loading ? <Spinner /> : startIcon ? <ui.Icon name={startIcon} /> : null}
          {children}
          {endIcon ? <ui.Icon name={endIcon} /> : null}
        </B>
      )
    }
    components.LinkButton = function ShadcnLinkButton({
      color,
      size,
      disabled,
      startIcon,
      endIcon,
      children,
      href,
      ...props
    }: LinkButtonSlotProps) {
      const ui = useUi()
      return (
        <B asChild variant={colorToShadcnVariant(color)} size={size ? SIZES[size] : undefined}>
          <ui.Link {...props} href={disabled ? undefined! : href} aria-disabled={disabled || undefined}>
            {startIcon ? <ui.Icon name={startIcon} /> : null}
            {children}
            {endIcon ? <ui.Icon name={endIcon} /> : null}
          </ui.Link>
        </B>
      )
    }
  }

  if (has(c, ["Card", "CardHeader", "CardTitle", "CardContent"])) {
    const { Card, CardHeader, CardTitle, CardContent } = c
    const CardDescription = c.CardDescription ?? "p"
    const CardFooter = c.CardFooter ?? "div"
    components.Card = function ShadcnCard({ title, subtitle, footer, imageTop, className, children }: CardSlotProps) {
      return (
        <Card className={className}>
          {imageTop}
          {title || subtitle ? (
            <CardHeader>
              {title ? <CardTitle>{title}</CardTitle> : null}
              {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
            </CardHeader>
          ) : null}
          <CardContent>{children}</CardContent>
          {footer !== undefined ? <CardFooter>{footer}</CardFooter> : null}
        </Card>
      )
    }
    components.CardHeader = CardHeader
    components.CardTitle = CardTitle
    if (c.CardDescription) components.CardSubtitle = c.CardDescription
    if (c.CardFooter) components.CardFooter = c.CardFooter
  }

  if (c.Alert) {
    const { Alert } = c
    const AlertTitle = c.AlertTitle ?? "div"
    const AlertDescription = c.AlertDescription ?? "div"
    components.Alert = function ShadcnAlert({
      type,
      heading,
      icon,
      dismissible: _dismissible,
      className,
      children,
    }: AlertSlotProps) {
      return (
        <Alert variant={type === "danger" ? "destructive" : "default"} className={className} data-type={type}>
          {icon}
          {heading ? <AlertTitle>{heading}</AlertTitle> : null}
          {children ? <AlertDescription>{children}</AlertDescription> : null}
        </Alert>
      )
    }
    components.ErrorSummary = function ShadcnErrorSummary({
      id,
      title,
      description,
      items,
      onSelect,
      className,
    }: ErrorSummarySlotProps) {
      return (
        <Alert variant="destructive" id={id} className={className} data-slot="error-summary">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>
            {description ? <p>{description}</p> : null}
            {items.length ? (
              <ul className="list-inside list-disc text-sm">
                {items.flatMap((item) =>
                  item.messages.map((message, i) => (
                    <li key={`${item.name}-${i}`}>
                      <a
                        href={`#${item.name}`}
                        className="underline underline-offset-4"
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
          </AlertDescription>
        </Alert>
      )
    }
  }

  if (c.Badge) {
    const Badge = c.Badge
    components.Status = function ShadcnStatus({ tone, className, children }: StatusSlotProps) {
      return (
        <Badge variant={BADGE_VARIANTS[tone]} data-tone={tone} className={className}>
          {children}
        </Badge>
      )
    }
  }

  if (has(c, ["Table", "TableHeader", "TableBody", "TableRow", "TableHead", "TableCell"])) {
    Object.assign(components, {
      Table: c.Table,
      TableHeader: c.TableHeader,
      TableBody: c.TableBody,
      TableRow: c.TableRow,
      TableHead: c.TableHead,
      TableCell: c.TableCell,
    })
  }

  if (has(c, ["Tabs", "TabsList", "TabsTrigger", "TabsContent"])) {
    const { Tabs, TabsList, TabsTrigger, TabsContent } = c
    components.Tabs = function ShadcnTabs({ items, defaultValue, onValueChange, className }: TabsSlotProps) {
      return (
        <Tabs defaultValue={defaultValue} onValueChange={onValueChange} className={className}>
          <TabsList>
            {items.map((item) => (
              <TabsTrigger key={item.value} value={item.value} disabled={item.disabled}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {items.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              {item.content}
            </TabsContent>
          ))}
        </Tabs>
      )
    }
  }

  if (has(c, ["Accordion", "AccordionItem", "AccordionTrigger", "AccordionContent"])) {
    const { Accordion, AccordionItem, AccordionTrigger, AccordionContent } = c
    components.Accordion = function ShadcnAccordion({
      id,
      items,
      defaultValue,
      multiple,
      className,
    }: AccordionSlotProps) {
      const content = items.map((item) => (
        <AccordionItem key={item.value} value={item.value} id={item.id} disabled={item.disabled}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))
      return multiple ? (
        <Accordion id={id} type="multiple" defaultValue={defaultValue} className={className}>
          {content}
        </Accordion>
      ) : (
        <Accordion id={id} type="single" collapsible defaultValue={defaultValue[0]} className={className}>
          {content}
        </Accordion>
      )
    }
  }

  if (has(c, ["Dialog", "DialogContent", "DialogTitle"])) {
    const { Dialog, DialogContent, DialogTitle } = c
    const DialogTrigger = c.DialogTrigger
    const DialogHeader = c.DialogHeader ?? "div"
    const DialogDescription = c.DialogDescription ?? "p"
    const DialogFooter = c.DialogFooter ?? "div"
    const WIDTHS = {
      sm: "sm:max-w-sm",
      md: "sm:max-w-lg",
      lg: "sm:max-w-2xl",
      xl: "sm:max-w-4xl",
      full: "sm:max-w-[calc(100%-2rem)]",
    }
    components.Modal = function ShadcnModal({
      id,
      open,
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
      return (
        <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
          {trigger && DialogTrigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
          <DialogContent id={id} className={cx(WIDTHS[size], className)}>
            <DialogHeader>
              <DialogTitle className={title ? undefined : "sr-only"}>{title}</DialogTitle>
              {description ? <DialogDescription>{description}</DialogDescription> : null}
            </DialogHeader>
            {children}
            {footer ? <DialogFooter>{footer}</DialogFooter> : null}
          </DialogContent>
        </Dialog>
      )
    }
  }

  if (has(c, ["DropdownMenu", "DropdownMenuTrigger", "DropdownMenuContent", "DropdownMenuItem"])) {
    const { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } = c
    components.ActionMenu = function ShadcnActionMenu({ label, trigger, items }: ActionMenuSlotProps) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild aria-label={label}>
            {trigger}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {items.map((item, i) => (
              <DropdownMenuItem key={i} onSelect={item.onSelect}>
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }

  return defineAdapter({ name: options.name ?? "shadcn", components, confirm: options.confirm, notify: options.notify })
}
