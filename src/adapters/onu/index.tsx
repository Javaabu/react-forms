"use client"

import * as React from "react"
import {
  Accordion,
  ActionMenu,
  ApiSelect,
  Button,
  ButtonGroup,
  Callout,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  DatePicker,
  DateTimePicker,
  DescriptionList,
  DescriptionListItem,
  EmptyState,
  FieldErrors,
  FileInput,
  FormField,
  HelpText,
  Icon,
  ImageInput,
  Label,
  LinkButton,
  Modal,
  NavTabs,
  NumberInput,
  Pagination,
  PasswordInput,
  RequiredMarker,
  SearchableSelect,
  Select,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TextInput,
  Textarea,
  TimePicker,
  ValidationSummary,
  confirm,
  toast,
  type ButtonVariant,
  type ChoiceOption,
} from "@javaabu/onu"

import {
  defineAdapter,
  type AccordionSlotProps,
  type ActionMenuSlotProps,
  type AlertSlotProps,
  type ButtonColor,
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
  type IconSlotProps,
  type ImageSlotProps,
  type InputSlotProps,
  type LabelSlotProps,
  type LinkButtonSlotProps,
  type ModalSlotProps,
  type NavTabsSlotProps,
  type NumberSlotProps,
  type PaginationSlotProps,
  type RadioSlotProps,
  type RequiredMarkerSlotProps,
  type SelectSlotProps,
  type StatusSlotProps,
  type TabsSlotProps,
  type TextareaSlotProps,
} from "../../core/adapter"
import { TabPanel } from "../../core/reveal"
import { parseDateValue, toDateString, toDateTimeString, toTimeString } from "../../support/dates"

/** Bootstrap colours (Blade's `color`) and the Onu button variants they map to. */
const VARIANTS: Record<string, ButtonVariant> = {
  primary: "default",
  secondary: "secondary",
  success: "success",
  danger: "destructive",
  warning: "warning",
  info: "default",
  light: "outline",
  dark: "secondary",
  link: "link",
}

/** The Onu variant for a Blade button colour (`outline-*` → `outline`). */
export function colorToVariant(color: ButtonColor | string | undefined): ButtonVariant {
  if (!color) return "default"
  if (color.startsWith("outline-")) return "outline"
  return VARIANTS[color] ?? "default"
}

const BUTTON_SIZES = { sm: "sm", md: "default", lg: "lg", icon: "icon" } as const

/* -------------------------------------------------------------------------- */
/* Form scaffolding                                                           */
/* -------------------------------------------------------------------------- */

function OnuForm({ processing: _processing, className, ...props }: FormSlotProps) {
  return <form data-slot="form" className={["gap-6 grid", className].filter(Boolean).join(" ")} {...props} />
}

function OnuField({
  id,
  name,
  label,
  hideLabel,
  inline,
  help,
  errors,
  disabled,
  classNames,
  children,
}: FieldSlotProps) {
  return (
    <FormField
      // The core already put the required marker in the label and computed ids.
      label={label}
      name={name}
      id={id}
      help={help}
      error={errors}
      disabled={disabled}
      labelLayout={inline ? "inline" : undefined}
      hideLabel={hideLabel}
      className={classNames?.group}
      classNames={{ label: classNames?.label, control: classNames?.control }}
    >
      {children}
    </FormField>
  )
}

function OnuLabel({ required: _required, ...props }: LabelSlotProps) {
  return <Label {...props} />
}

function OnuRequiredMarker({ symbol, className }: RequiredMarkerSlotProps) {
  return <RequiredMarker symbol={symbol} className={className} />
}

function OnuHelpText(props: HelpTextSlotProps) {
  return <HelpText {...props} />
}

function OnuFieldErrors(props: FieldErrorsSlotProps) {
  return <FieldErrors {...props} />
}

function OnuErrorSummary({ title, description, items, className }: ErrorSummarySlotProps) {
  const errors = Object.fromEntries(items.map((item) => [item.name, item.messages]))
  const labels = Object.fromEntries(items.filter((i) => i.label).map((item) => [item.name, item.label]))
  return <ValidationSummary errors={errors} title={title} message={description} labels={labels} className={className} />
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                   */
/* -------------------------------------------------------------------------- */

function OnuInput({ prepend, append, thaana, thaanaToggle, type, size: _size, ...props }: InputSlotProps) {
  const common = { ...props, startAddon: prepend, endAddon: append }
  if (type === "password") return <PasswordInput {...common} />
  return <TextInput {...common} type={type} thaana={thaana} thaanaToggle={thaanaToggle} urlProtocol={false} />
}

function OnuTextarea({ thaana, ...props }: TextareaSlotProps) {
  return <Textarea {...props} thaana={thaana} />
}

function OnuNumber({ value, onValueChange, decimals, prepend, append, ...props }: NumberSlotProps) {
  return (
    <NumberInput
      {...props}
      startAddon={prepend}
      endAddon={append}
      // Blade prints the raw number; keep it ungrouped with all its decimals.
      formatOptions={{ useGrouping: false, maximumFractionDigits: decimals ?? 10 }}
      value={value}
      onValueChange={(n) => onValueChange(n ?? null)}
    />
  )
}

function OnuCheckbox({ checked, onCheckedChange, label, ...props }: CheckboxSlotProps) {
  return (
    <Checkbox
      {...props}
      name={props.name || undefined}
      checked={checked}
      label={label}
      onCheckedChange={(state) => onCheckedChange(state === true)}
    />
  )
}

function OnuRadio({ checked, onCheckedChange, label, className, ...props }: RadioSlotProps) {
  return (
    <div data-slot="radio" className={["gap-2 flex items-center", className].filter(Boolean).join(" ")}>
      <input
        {...props}
        type="radio"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:outline aria-invalid:outline-destructive"
      />
      {label ? (
        <label htmlFor={props.id} className="text-sm leading-none cursor-pointer select-none">
          {label}
        </label>
      ) : null}
    </div>
  )
}

function OnuSelect({
  options,
  value,
  onValueChange,
  multiple,
  searchable,
  clearable,
  creatable,
  placeholder,
  loading: _loading,
  remote,
  ...props
}: SelectSlotProps) {
  const choices = options as ChoiceOption[]
  const create = creatable ? { onCreate: (label: string): ChoiceOption => ({ value: label, label }) } : {}

  if (remote) {
    const api = {
      ...props,
      placeholder,
      clearable,
      url: remote.url,
      initialOptions: choices,
      valueKey: remote.valueKey,
      labelKey: remote.labelKey,
      searchParam: remote.searchParam,
      params: remote.params,
      minChars: remote.minChars,
      dependsOn: remote.dependsOn,
    }
    return multiple ? (
      <ApiSelect {...api} multiple value={value} onValueChange={(v: string[]) => onValueChange(v)} />
    ) : (
      <ApiSelect {...api} value={value[0] ?? null} onValueChange={(v: string | null) => onValueChange(v ? [v] : [])} />
    )
  }

  if (multiple || searchable || creatable) {
    return multiple ? (
      <SearchableSelect
        {...props}
        {...create}
        multiple
        options={choices}
        placeholder={placeholder}
        clearable={clearable}
        value={value}
        onValueChange={(v: string[]) => onValueChange(v)}
      />
    ) : (
      <SearchableSelect
        {...props}
        {...create}
        options={choices}
        placeholder={placeholder}
        clearable={clearable}
        value={value[0] ?? null}
        onValueChange={(v: string | null) => onValueChange(v ? [v] : [])}
      />
    )
  }

  return (
    <Select
      {...props}
      options={choices}
      placeholder={placeholder}
      clearable={clearable}
      value={value[0] ?? ""}
      onValueChange={(v: string) => onValueChange(v ? [v] : [])}
    />
  )
}

const FORMAT = { date: toDateString, datetime: toDateTimeString, time: toTimeString } as const

function OnuDate({ mode, value, onValueChange, name, min, max, ...props }: DateSlotProps) {
  const date = parseDateValue(value)
  const change = (next: Date | null) => onValueChange(next ? FORMAT[mode](next) : "")
  const minDate = min ? (parseDateValue(min) ?? undefined) : undefined
  const maxDate = max ? (parseDateValue(max) ?? undefined) : undefined
  return (
    <>
      {mode === "date" ? (
        <DatePicker {...props} value={date} onValueChange={change} min={minDate} max={maxDate} />
      ) : mode === "datetime" ? (
        <DateTimePicker {...props} value={date} onValueChange={change} min={minDate} max={maxDate} />
      ) : (
        <TimePicker {...props} value={date} onValueChange={change} />
      )}
      {/* Submit the Laravel format, whatever the picker shows. */}
      <input type="hidden" name={name} value={value} disabled={props.disabled} />
    </>
  )
}

function OnuFile({ onFilesChange, name, ...props }: FileSlotProps) {
  return (
    <FileInput
      {...props}
      name={name || undefined}
      onFilesAdded={onFilesChange}
      onValueChange={(entries) => {
        if (!entries.length) onFilesChange([])
      }}
    />
  )
}

function OnuImage({ shape, cover, fullWidth, className, name, ...props }: ImageSlotProps) {
  return (
    <ImageInput
      {...props}
      name={name || undefined}
      shape={shape === "circle" ? "circle" : undefined}
      className={[fullWidth ? "max-w-none" : undefined, className].filter(Boolean).join(" ") || undefined}
      classNames={cover ? { image: "object-cover" } : undefined}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Buttons and links                                                          */
/* -------------------------------------------------------------------------- */

function OnuButton({ color, size, ...props }: ButtonSlotProps) {
  return <Button {...props} variant={colorToVariant(color)} size={size ? BUTTON_SIZES[size] : undefined} />
}

function OnuLinkButton({ color, size, ...props }: LinkButtonSlotProps) {
  return <LinkButton {...props} variant={colorToVariant(color)} size={size ? BUTTON_SIZES[size] : undefined} />
}

function OnuButtonGroup(props: ButtonGroupSlotProps) {
  return <ButtonGroup {...props} />
}

function OnuIcon({ name, size, className }: IconSlotProps) {
  return <Icon name={name} size={size === "sm" ? "sm" : undefined} className={className} />
}

function OnuActionMenu({ label, trigger, items }: ActionMenuSlotProps) {
  return (
    <ActionMenu
      label={label}
      trigger={trigger}
      items={items.map((item) => ({ label: item.label, onSelect: item.onSelect }))}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Display                                                                    */
/* -------------------------------------------------------------------------- */

const ALERT_TONES = {
  primary: "info",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
} as const

function OnuAlert({ type, heading, icon, ...props }: AlertSlotProps) {
  const tone = ALERT_TONES[type as keyof typeof ALERT_TONES] ?? "neutral"
  return <Callout {...props} tone={tone} title={heading} icon={icon === undefined ? false : icon} />
}

function OnuCard({ title, subtitle, footer, imageTop, children, className }: CardSlotProps) {
  return (
    <Card title={title} description={subtitle} footer={footer} media={imageTop} className={className}>
      {children}
    </Card>
  )
}

function OnuAccordion({ id, items, defaultValue, multiple, className }: AccordionSlotProps) {
  const list = items.map(({ value, title, content, disabled }) => ({ value, title, content, disabled }))
  return multiple ? (
    <Accordion id={id} type="multiple" defaultValue={defaultValue} items={list} className={className} />
  ) : (
    <Accordion id={id} type="single" defaultValue={defaultValue[0]} items={list} className={className} />
  )
}

function OnuTabs({ items, defaultValue, onValueChange, className }: TabsSlotProps) {
  const [active, setActive] = React.useState(defaultValue)
  const id = React.useId()
  const select = (value: string) => {
    setActive(value)
    onValueChange(value)
  }
  // Onu's panels unmount when inactive; render the list with Onu and keep every panel mounted, so fields submit.
  return (
    <div className={className}>
      <Tabs
        value={active}
        onValueChange={select}
        controls={`${id}-panels`}
        items={items.map(({ value, label, disabled }) => ({ value, label, disabled }))}
      />
      <div id={`${id}-panels`} className="pt-4">
        {items.map((item) => (
          <TabPanel key={item.value} active={active === item.value} onReveal={() => select(item.value)}>
            {item.content}
          </TabPanel>
        ))}
      </div>
    </div>
  )
}

function OnuNavTabs({ items, className }: NavTabsSlotProps) {
  return (
    <NavTabs
      className={className}
      items={items.map((item) => ({
        label: item.label,
        href: item.href,
        isActive: item.active,
        disabled: item.disabled,
        icon: item.icon,
      }))}
    />
  )
}

function OnuModal({ title, size, ...props }: ModalSlotProps) {
  return <Modal {...props} size={size === "md" ? "default" : size} title={title ?? ""} hideTitle={!title} />
}

function OnuStatus({ tone, className, children }: StatusSlotProps) {
  return (
    <StatusBadge status={tone} icon={false} className={className}>
      {children}
    </StatusBadge>
  )
}

function OnuDescriptionList({ layout, className, children }: DescriptionListSlotProps) {
  return (
    <DescriptionList layout={layout} divided={layout === "auto"} className={className}>
      {children}
    </DescriptionList>
  )
}

function OnuDescriptionItem({ label, classNames, className, children }: DescriptionItemSlotProps) {
  return (
    <DescriptionListItem label={label} classNames={classNames} className={className}>
      {children}
    </DescriptionListItem>
  )
}

function OnuEmptyState(props: EmptyStateSlotProps) {
  return <EmptyState {...props} />
}

function OnuPagination({ currentPage, lastPage, hrefFor, onPageChange, className }: PaginationSlotProps) {
  return (
    <Pagination
      className={className}
      paginator={{ current_page: currentPage, last_page: lastPage, per_page: 0 }}
      getPageHref={hrefFor}
      onPageChange={onPageChange}
    />
  )
}

/** Form components on Onu, Javaabu's React UI library. */
export const onu = defineAdapter({
  name: "onu",
  confirm: ({ title, description, confirmLabel, cancelLabel, destructive }) =>
    confirm({ title, description, confirmLabel, cancelLabel, variant: destructive ? "destructive" : undefined }),
  notify: (message, options) => {
    if (options?.type === "error") toast.error(message)
    else if (options?.type === "success") toast.success(message)
    else toast(message)
  },
  components: {
    Form: OnuForm,
    Field: OnuField,
    Label: OnuLabel,
    RequiredMarker: OnuRequiredMarker,
    HelpText: OnuHelpText,
    FieldErrors: OnuFieldErrors,
    ErrorSummary: OnuErrorSummary,
    Input: OnuInput,
    Textarea: OnuTextarea,
    Number: OnuNumber,
    Checkbox: OnuCheckbox,
    Radio: OnuRadio,
    Select: OnuSelect,
    Date: OnuDate,
    File: OnuFile,
    Image: OnuImage,
    Button: OnuButton,
    LinkButton: OnuLinkButton,
    ButtonGroup: OnuButtonGroup,
    Icon: OnuIcon,
    ActionMenu: OnuActionMenu,
    Alert: OnuAlert,
    Card: OnuCard,
    CardHeader,
    CardTitle,
    CardSubtitle: CardDescription,
    CardFooter,
    Accordion: OnuAccordion,
    Tabs: OnuTabs,
    NavTabs: OnuNavTabs,
    Modal: OnuModal,
    Status: OnuStatus,
    DescriptionList: OnuDescriptionList,
    DescriptionItem: OnuDescriptionItem,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    EmptyState: OnuEmptyState,
    Pagination: OnuPagination,
  },
})
