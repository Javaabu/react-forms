import type * as React from "react"

/**
 * The adapter contract: what a UI framework implements so the form components
 * can render with it. Every slot is a React component that receives resolved,
 * UI-neutral props. The core works out names, ids, labels, values, errors and
 * ARIA wiring; a slot only renders them.
 *
 * Rules every slot follows (checked by `@javaabu/forms/testing`):
 * - Value slots are controlled: render `value` / `checked` and report changes
 *   through `onValueChange` / `onCheckedChange` (or the composed `onChange` of
 *   native-element slots).
 * - Native submit keeps working: a control with a `name` puts its value in the
 *   form's `FormData` under that name, with a native or hidden input.
 * - `id`, `aria-invalid` and `aria-describedby` go on the focusable element.
 */

/* -------------------------------------------------------------------------- */
/* Shared                                                                     */
/* -------------------------------------------------------------------------- */

/** Bootstrap colour names, as in the Blade components (`color="danger"`, `outline-primary`). */
export type ButtonColor =
  "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "link" | `outline-${string}`

/** The icons the components use. Adapters map them to their icon set. */
export type IconName =
  | "download"
  | "close"
  | "plus"
  | "error"
  | "chevron-up"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "chevrons-up-down"

/** Status tones (`Status`, enum badges). */
export type StatusTone = "success" | "danger" | "warning" | "info" | "neutral"

/** An option of a select. */
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  /** The `<optgroup>` label, when options are grouped. */
  group?: string
}

/** Props every control slot gets. */
export interface ControlProps {
  id?: string
  name: string
  required?: boolean
  disabled?: boolean
  /** Placed on the focusable element. `true` while the field has errors. */
  "aria-invalid"?: boolean
  /** Ids of the help text and errors. Placed on the focusable element. */
  "aria-describedby"?: string
  className?: string
}

/* -------------------------------------------------------------------------- */
/* Form scaffolding                                                           */
/* -------------------------------------------------------------------------- */

export interface FormSlotProps extends React.ComponentProps<"form"> {
  /** `true` while the form submits. */
  processing?: boolean
}

export interface FieldSlotProps {
  /** Id of the control, for the label's `htmlFor`. */
  id?: string
  name?: string
  /** Label content (already includes the required marker when `required`). Nothing is rendered without it. */
  label?: React.ReactNode
  labelId?: string
  /** Hide the label visually; keep it for screen readers (Blade's `show-label="false"`). */
  hideLabel?: boolean
  required?: boolean
  disabled?: boolean
  /** Label beside the control instead of above it. */
  inline?: boolean
  help?: React.ReactNode
  helpId?: string
  /** Error messages to show under the control. */
  errors: string[]
  errorId?: string
  classNames?: { group?: string; label?: string; control?: string }
  children: React.ReactNode
}

export interface LabelSlotProps extends React.ComponentProps<"label"> {
  /** Show the required marker after the text. */
  required?: boolean
}

export interface RequiredMarkerSlotProps {
  /** The marker text, `*` by default (`forms::strings.required_text`). */
  symbol: string
  className?: string
}

export interface HelpTextSlotProps {
  id?: string
  className?: string
  children?: React.ReactNode
}

export interface FieldErrorsSlotProps {
  id?: string
  errors: string[]
  className?: string
}

export interface ErrorSummaryItem {
  /** The field name, in dot notation. */
  name: string
  label?: React.ReactNode
  messages: string[]
}

export interface ErrorSummarySlotProps {
  id?: string
  title: React.ReactNode
  description?: React.ReactNode
  items: ErrorSummaryItem[]
  /** Move focus to the field. Call it from each item's link and prevent the default when it returns `true`. */
  onSelect: (name: string) => boolean
  className?: string
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * `<input>` for text-like types (`text`, `email`, `password`, `url`, `tel`, `search`, …).
 * Spread the remaining props onto the `<input>`: they are native attributes
 * with a controlled `value` and a composed `onChange`.
 */
export interface InputSlotProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "prefix"> {
  name: string
  type: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Content before the input (Blade's `prepend` slot). */
  prepend?: React.ReactNode
  /** Content after the input (Blade's `append` slot). */
  append?: React.ReactNode
  /** Type Thaana from a Latin keyboard (see `thaanaKeyDown`). */
  thaana?: boolean
  /** Show a Thaana / Latin toggle. */
  thaanaToggle?: boolean
}

/** `<textarea>`. Spread the remaining props onto it. */
export interface TextareaSlotProps extends Omit<React.ComponentProps<"textarea">, "value" | "onChange"> {
  name: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  /** Grow with the content. */
  autoResize?: boolean
  thaana?: boolean
}

export interface NumberSlotProps extends ControlProps {
  value: number | null
  onValueChange: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  /** Most decimals shown and submitted. */
  decimals?: number
  placeholder?: string
  prepend?: React.ReactNode
  append?: React.ReactNode
}

export interface CheckboxSlotProps extends ControlProps {
  /** Submitted under `name` when checked. */
  value: string
  checked: boolean | "indeterminate"
  onCheckedChange: (checked: boolean) => void
  /** Text beside the box. */
  label?: React.ReactNode
  "aria-label"?: string
}

export interface RadioSlotProps extends ControlProps {
  value: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: React.ReactNode
}

/** Options searched on the server (`Select2 isAjax`). Adapters without their own fetching use `useRemoteOptions()`. */
export interface RemoteOptions {
  url: string
  /** Query parameter of the search text. Default `filter[search]`. */
  searchParam: string
  /** Extra query parameters. */
  params: Record<string, string>
  valueKey: string
  labelKey: string
  minChars?: number
  /** Changes when the URL's context changes; refetch then. */
  dependsOn?: string
}

export interface SelectSlotProps extends ControlProps {
  options: SelectOption[]
  /** The selected values. One at most unless `multiple`. */
  value: string[]
  onValueChange: (value: string[]) => void
  multiple: boolean
  /** Show a search box (`Select2`). */
  searchable: boolean
  /** Show a clear button. */
  clearable: boolean
  /** Let users add values that are not in the list (`tags`). */
  creatable: boolean
  placeholder?: string
  /** Options are loading (cascading selects). */
  loading?: boolean
  /** Search the options on the server. */
  remote?: RemoteOptions
}

export type DateMode = "date" | "datetime" | "time"

export interface DateSlotProps extends ControlProps {
  mode: DateMode
  /** `yyyy-MM-dd`, `yyyy-MM-dd HH:mm:ss` or `HH:mm`; `""` when empty. Submit it as is. */
  value: string
  onValueChange: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
}

export interface FileSlotProps extends ControlProps {
  /** `""` when the file is uploaded on its own (`FileUpload`): don't submit it with the form. */
  name: string
  accept?: string
  /** Largest file, in bytes. */
  maxSize?: number
  multiple?: boolean
  onFilesChange: (files: File[]) => void
  buttonLabel: string
  placeholder: string
  /** List the picked files. */
  showList: boolean
}

export interface ImageSlotProps extends ControlProps {
  name: string
  accept?: string
  maxSize?: number
  /** The picked file, or the URL of the current image. */
  value: File | string | null
  onValueChange: (file: File | null) => void
  alt: string
  shape: "rectangle" | "circle"
  /** Width ÷ height of the preview. */
  aspectRatio: number
  /** Let the image cover the preview. */
  cover?: boolean
  fullWidth?: boolean
  placeholder: React.ReactNode
}

export interface WysiwygSlotProps extends ControlProps {
  /** HTML. */
  value: string
  onValueChange: (html: string) => void
  placeholder?: string
}

export interface LatLng {
  lat: number
  lng: number
}

export interface MapSlotProps {
  id?: string
  disabled?: boolean
  mode: "point" | "radius" | "polygon"
  point: LatLng | null
  onPointChange: (point: LatLng | null) => void
  /** Metres. */
  radius: number | null
  onRadiusChange: (radius: number | null) => void
  maxRadius: number
  /** Polygons as rings of `[lng, lat]` pairs (GeoJSON order). */
  polygons: number[][][][]
  onPolygonsChange: (polygons: number[][][][]) => void
  center?: LatLng
  className?: string
}

/* -------------------------------------------------------------------------- */
/* Buttons and links                                                          */
/* -------------------------------------------------------------------------- */

export interface ButtonSlotProps extends React.ComponentProps<"button"> {
  color: ButtonColor
  size?: "sm" | "md" | "lg" | "icon"
  /** Show a spinner and block clicks. */
  loading?: boolean
  startIcon?: IconName
  endIcon?: IconName
}

export interface LinkSlotProps extends React.ComponentProps<"a"> {
  href: string
}

export interface LinkButtonSlotProps extends LinkSlotProps {
  color: ButtonColor
  size?: "sm" | "md" | "lg" | "icon"
  disabled?: boolean
  startIcon?: IconName
  endIcon?: IconName
}

export interface ButtonGroupSlotProps {
  orientation: "horizontal" | "vertical"
  className?: string
  children?: React.ReactNode
}

export interface IconSlotProps {
  name: IconName
  size?: "sm" | "md"
  className?: string
}

export interface ActionMenuSlotProps {
  label: string
  trigger: React.ReactElement
  items: { label: React.ReactNode; onSelect: () => void }[]
}

/* -------------------------------------------------------------------------- */
/* Display                                                                    */
/* -------------------------------------------------------------------------- */

export interface AlertSlotProps {
  /** Bootstrap alert type: `primary`, `info`, `success`, `warning`, `danger`, … */
  type: string
  heading?: React.ReactNode
  icon?: React.ReactNode
  dismissible?: boolean
  className?: string
  children?: React.ReactNode
}

export interface CardSlotProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  footer?: React.ReactNode
  /** Content before the header (Blade's `image_top`). */
  imageTop?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export type CardPartSlotProps = React.ComponentProps<"div">

export interface AccordionSlotItem {
  value: string
  title: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
  id?: string
}

export interface AccordionSlotProps {
  id: string
  items: AccordionSlotItem[]
  /** Values of the open items. */
  defaultValue: string[]
  /** Allow several open items. */
  multiple: boolean
  className?: string
}

export interface TabsSlotItem {
  value: string
  label: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

export interface TabsSlotProps {
  items: TabsSlotItem[]
  defaultValue: string
  onValueChange: (value: string) => void
  className?: string
}

export interface NavTabsSlotProps {
  items: { label: React.ReactNode; href: string; active?: boolean; disabled?: boolean; icon?: React.ReactNode }[]
  className?: string
}

export interface ModalSlotProps {
  id?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Element that opens the modal. */
  trigger?: React.ReactElement
  title?: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  size: "sm" | "md" | "lg" | "xl" | "full"
  className?: string
  children?: React.ReactNode
}

export interface StatusSlotProps {
  tone: StatusTone
  className?: string
  children?: React.ReactNode
}

export interface DescriptionListSlotProps {
  layout: "auto" | "stacked" | "inline"
  className?: string
  children?: React.ReactNode
}

export interface DescriptionItemSlotProps {
  label?: React.ReactNode
  classNames?: { label?: string; value?: string }
  className?: string
  children?: React.ReactNode
}

/* -------------------------------------------------------------------------- */
/* Listing                                                                    */
/* -------------------------------------------------------------------------- */

export interface EmptyStateSlotProps {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export interface PaginationSlotProps {
  currentPage: number
  lastPage: number
  /** Link of a page. Without it, pages are buttons that call `onPageChange`. */
  hrefFor?: (page: number) => string
  onPageChange?: (page: number) => void
  className?: string
}

/* -------------------------------------------------------------------------- */
/* The adapter                                                                */
/* -------------------------------------------------------------------------- */

/** Every slot an adapter can implement. Missing slots render with the HTML base adapter. */
export interface FormsComponents {
  Form: React.ComponentType<FormSlotProps>
  Field: React.ComponentType<FieldSlotProps>
  Label: React.ComponentType<LabelSlotProps>
  RequiredMarker: React.ComponentType<RequiredMarkerSlotProps>
  HelpText: React.ComponentType<HelpTextSlotProps>
  FieldErrors: React.ComponentType<FieldErrorsSlotProps>
  ErrorSummary: React.ComponentType<ErrorSummarySlotProps>

  Input: React.ComponentType<InputSlotProps>
  Textarea: React.ComponentType<TextareaSlotProps>
  Number: React.ComponentType<NumberSlotProps>
  Checkbox: React.ComponentType<CheckboxSlotProps>
  Radio: React.ComponentType<RadioSlotProps>
  Select: React.ComponentType<SelectSlotProps>
  Date: React.ComponentType<DateSlotProps>
  File: React.ComponentType<FileSlotProps>
  Image: React.ComponentType<ImageSlotProps>
  Wysiwyg: React.ComponentType<WysiwygSlotProps>
  Map: React.ComponentType<MapSlotProps>

  Button: React.ComponentType<ButtonSlotProps>
  Link: React.ComponentType<LinkSlotProps>
  LinkButton: React.ComponentType<LinkButtonSlotProps>
  ButtonGroup: React.ComponentType<ButtonGroupSlotProps>
  Icon: React.ComponentType<IconSlotProps>
  ActionMenu: React.ComponentType<ActionMenuSlotProps>

  Alert: React.ComponentType<AlertSlotProps>
  Card: React.ComponentType<CardSlotProps>
  CardHeader: React.ComponentType<CardPartSlotProps>
  CardTitle: React.ComponentType<CardPartSlotProps>
  CardSubtitle: React.ComponentType<CardPartSlotProps>
  CardFooter: React.ComponentType<CardPartSlotProps>
  Accordion: React.ComponentType<AccordionSlotProps>
  Tabs: React.ComponentType<TabsSlotProps>
  NavTabs: React.ComponentType<NavTabsSlotProps>
  Modal: React.ComponentType<ModalSlotProps>
  Status: React.ComponentType<StatusSlotProps>
  DescriptionList: React.ComponentType<DescriptionListSlotProps>
  DescriptionItem: React.ComponentType<DescriptionItemSlotProps>

  Table: React.ComponentType<React.ComponentProps<"table">>
  TableHeader: React.ComponentType<React.ComponentProps<"thead">>
  TableBody: React.ComponentType<React.ComponentProps<"tbody">>
  TableRow: React.ComponentType<React.ComponentProps<"tr">>
  TableHead: React.ComponentType<React.ComponentProps<"th">>
  TableCell: React.ComponentType<React.ComponentProps<"td">>
  EmptyState: React.ComponentType<EmptyStateSlotProps>
  Pagination: React.ComponentType<PaginationSlotProps>
}

export type SlotName = keyof FormsComponents

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  destructive?: boolean
}

/** Imperative UI the components use: confirmation dialogs and notifications. */
export interface FormsServices {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  notify: (message: string, options?: { type?: "error" | "success" | "info" }) => void
}

export interface FormsAdapter extends Partial<FormsServices> {
  /** For error messages and devtools: `"onu"`, `"shadcn"`, … */
  name: string
  components: Partial<FormsComponents>
}

/** Types an adapter. Returns it unchanged. */
export function defineAdapter<A extends FormsAdapter>(adapter: A): A {
  return adapter
}

/** Combines adapters; later ones win slot by slot (`mergeAdapters(onu, onuEditor, onuMaps)`). */
export function mergeAdapters(...adapters: FormsAdapter[]): FormsAdapter {
  return adapters.reduce<FormsAdapter>(
    (merged, adapter) => ({
      ...merged,
      ...adapter,
      name: merged.name ? `${merged.name}+${adapter.name}` : adapter.name,
      components: { ...merged.components, ...adapter.components },
    }),
    { name: "", components: {} },
  )
}
