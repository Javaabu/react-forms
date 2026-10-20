"use client"

import * as React from "react"
import {
  Accordion as OnuAccordion,
  Callout,
  Card as OnuCard,
  CardContent,
  CardDescription,
  CardFooter as OnuCardFooter,
  CardHeader as OnuCardHeader,
  CardTitle as OnuCardTitle,
  ConditionalDisplay,
  ConditionalLink as OnuConditionalLink,
  DescriptionList,
  DescriptionListItem,
  Modal as OnuModal,
  NavTabs as OnuNavTabs,
  StatusBadge,
  Tabs as OnuTabs,
  type ModalProps as OnuModalProps,
} from "@javaabu/onu"

import { getBoundValue, Model, useBindTarget, type ModelProp } from "../context/binding"
import { useFormsConfig, useFormsTranslation } from "../context/forms-provider"
import { useWatchField } from "../context/registry"
import { isNil } from "../support/data"
import { kebab, nameToId, nameToLabel, slotName } from "../support/str"
import { colorToTone, FormattedValue } from "./format"

/** An icon given as a semantic name (`"info"`) or, as in Blade, CSS classes (`"fa-solid fa-circle-info"`). */
export function renderIconProp(icon: React.ReactNode): React.ReactNode {
  if (typeof icon === "string" && icon.includes(" ")) return <i className={icon} aria-hidden="true" />
  return icon
}

/* -------------------------------------------------------------------------- */
/* Alert                                                                      */
/* -------------------------------------------------------------------------- */

const ALERT_VARIANTS = {
  primary: "info",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "destructive",
} as const

export interface AlertProps extends Omit<React.ComponentProps<typeof Callout>, "variant" | "title" | "icon"> {
  /** Bootstrap alert type (`primary`, `success`, `warning`, `danger`, `info`, …). Default `primary`. */
  type?: string
  /** Heading above the message. */
  heading?: React.ReactNode
  /** Icon: a semantic name or CSS classes. */
  icon?: React.ReactNode
  dismissible?: boolean
}

/** `<x-forms::alert>`: a message box (Onu `Callout`). */
export function Alert({ type = "primary", heading, icon, ...props }: AlertProps) {
  const variant = ALERT_VARIANTS[type as keyof typeof ALERT_VARIANTS] ?? "default"
  return (
    <Callout {...props} variant={variant} title={heading} icon={icon === undefined ? false : renderIconProp(icon)} />
  )
}

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

export interface CardProps extends Omit<React.ComponentProps<typeof OnuCard>, "title" | "description"> {
  title?: React.ReactNode
  /** Text under the title (Blade's `subtitle` slot). */
  subtitle?: React.ReactNode
  /** Header content when there is no title (Blade's `header` slot). */
  header?: React.ReactNode
  /** Content before the header, e.g. an image (Blade's `image_top` slot). */
  imageTop?: React.ReactNode
}

/** `<x-forms::card>`. */
export function Card({ title, subtitle, header, imageTop, footer, children, ...props }: CardProps) {
  const composed = !!(title || subtitle || header || footer !== undefined || imageTop)
  return (
    <OnuCard {...props} title={title ?? header} description={subtitle} footer={footer}>
      {imageTop}
      {composed ? <CardContent>{children}</CardContent> : children}
    </OnuCard>
  )
}

/** `<x-forms::card.header>`. */
export const CardHeader = OnuCardHeader
/** `<x-forms::card.title>`. */
export const CardTitle = OnuCardTitle
/** `<x-forms::card.subtitle>`. */
export const CardSubtitle = CardDescription
/** `<x-forms::card.footer>`. */
export const CardFooter = OnuCardFooter

/* -------------------------------------------------------------------------- */
/* Accordion                                                                  */
/* -------------------------------------------------------------------------- */

export interface AccordionItemData {
  title?: React.ReactNode
  content?: React.ReactNode
  /** Starts expanded. */
  show?: boolean
  /** Id of the item wrapper. */
  id?: string
}

export interface AccordionItemProps extends AccordionItemData {
  /** Panel id (Blade's `name`). */
  name: string
  /** Header content; wins over `title` (Blade's `header` slot). */
  header?: React.ReactNode
  children?: React.ReactNode
  disabled?: boolean
}

/**
 * `<x-forms::accordion.item>`. Place inside `Accordion`, which reads its props;
 * it renders nothing on its own.
 */
export function AccordionItem(_props: AccordionItemProps): React.ReactNode {
  return null
}

export interface AccordionProps {
  /** Accordion id. Numeric item keys become `<id>-item-<key>-collapse`. */
  id: string
  /** Items: an object keyed by panel name, or a list. */
  items?: Record<string, AccordionItemData> | AccordionItemData[]
  /**
   * Content by slot name, like Blade's named slots: `applicationRequirements` (or
   * `application-requirements`) for the body, `…Header` for the header; `item-0` for list items.
   */
  slots?: Record<string, React.ReactNode>
  /** `AccordionItem` elements, after the generated items. */
  children?: React.ReactNode
  variant?: React.ComponentProps<typeof OnuAccordion>["variant"]
  className?: string
}

function textContent(content: React.ReactNode) {
  return typeof content === "string" ? <span className="whitespace-pre-line">{content}</span> : content
}

/** `<x-forms::accordion>`: collapsible panels from `items` and/or `AccordionItem` children. */
export function Accordion({ id, items, slots = {}, children, variant, className }: AccordionProps) {
  const slot = (key: string) => slots[key] ?? slots[kebab(key)]
  const entries: Array<{
    value: string
    title: React.ReactNode
    content: React.ReactNode
    show: boolean
    disabled?: boolean
    id?: string
  }> = []

  const list = Array.isArray(items) ? items.map((item, i) => [String(i), item] as const) : Object.entries(items ?? {})
  for (const [key, item] of list) {
    const numeric = /^\d+$/.test(key)
    const name = numeric ? `item${key}` : slotName(key)
    const header = slot(`${name}Header`) ?? (numeric ? slots[`item-${key}-header`] : undefined)
    const body = slot(name) ?? (numeric ? slots[`item-${key}`] : undefined)
    entries.push({
      value: numeric ? `${id}-item-${key}-collapse` : key.replace(/ /g, "-"),
      title: header ?? item.title ?? "",
      content: body ?? textContent(item.content ?? ""),
      show: !!item.show,
      id: item.id,
    })
  }

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<AccordionItemProps>(child) || child.type !== AccordionItem) return
    const p = child.props
    entries.push({
      value: p.name,
      title: p.header ?? p.title ?? "",
      content: p.content ? textContent(p.content) : p.children,
      show: !!p.show,
      disabled: p.disabled,
      id: p.id,
    })
  })

  const open = entries.filter((e) => e.show).map((e) => e.value)
  const onuItems = entries.map(({ value, title, content, disabled }) => ({ value, title, content, disabled }))

  return open.length > 1 ? (
    <OnuAccordion
      id={id}
      type="multiple"
      defaultValue={open}
      items={onuItems}
      variant={variant}
      className={className}
    />
  ) : (
    <OnuAccordion
      id={id}
      type="single"
      defaultValue={open[0]}
      items={onuItems}
      variant={variant}
      className={className}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Tabs                                                                       */
/* -------------------------------------------------------------------------- */

export interface TabData {
  /** Tab name, preferably kebab case. Used to match its pane. */
  name: string
  /** Default: generated from `name`. */
  title?: React.ReactNode
  disabled?: boolean
  /** Link to a page instead of showing a pane. */
  url?: string
  content?: React.ReactNode
}

export interface TabsPaneProps {
  /** Name of the tab this pane belongs to. */
  name: string
  children?: React.ReactNode
}

/** `<x-forms::tabs.pane>`: the content of the tab with the same `name`. Place inside `Tabs`. */
export function TabsPane(_props: TabsPaneProps): React.ReactNode {
  return null
}

export interface TabsProps extends Omit<React.ComponentProps<typeof OnuTabs>, "items" | "defaultValue" | "children"> {
  tabs: TabData[]
  /** Name of the active tab. Default: the first. */
  active?: string
  /** Pane content by slot name (`profile`, `contactDetails`), like Blade's named slots. */
  slots?: Record<string, React.ReactNode>
  /** `TabsPane` elements. */
  children?: React.ReactNode
}

/** `<x-forms::tabs>`. */
export function Tabs({ tabs, active, slots = {}, children, onValueChange, ...props }: TabsProps) {
  const { translate } = useFormsTranslation()
  const panes = new Map<string, React.ReactNode>()
  React.Children.forEach(children, (child) => {
    if (React.isValidElement<TabsPaneProps>(child) && child.type === TabsPane)
      panes.set(child.props.name, child.props.children)
  })
  const urls = new Map(tabs.filter((t) => t.url).map((t) => [nameToId(t.name), t.url!]))

  return (
    <OnuTabs
      {...props}
      defaultValue={nameToId(active || tabs[0]?.name || "")}
      onValueChange={(value) => {
        const url = urls.get(value)
        if (url) window.location.assign(url)
        else onValueChange?.(value)
      }}
      items={tabs.map((tab) => ({
        value: nameToId(tab.name),
        label: tab.title ?? translate(nameToLabel(tab.name.replace(/-/g, "_"))),
        disabled: tab.disabled,
        content: tab.content ?? panes.get(tab.name) ?? slots[slotName(tab.name)] ?? slots[tab.name],
      }))}
    />
  )
}

export interface NavTabData {
  title: React.ReactNode
  url?: string
  active?: boolean
  disabled?: boolean
  /** Semantic icon name or CSS classes. */
  icon?: string
}

export interface NavTabsProps extends Omit<React.ComponentProps<typeof OnuNavTabs>, "items"> {
  tabs: NavTabData[]
}

/** `<x-forms::nav-tabs>`: tabs that are links to pages. */
export function NavTabs({ tabs, ...props }: NavTabsProps) {
  return (
    <OnuNavTabs
      {...props}
      items={tabs.map((tab) => ({
        label: tab.title,
        href: tab.url || "#",
        isActive: tab.active,
        disabled: tab.disabled,
        icon: tab.icon ? renderIconProp(tab.icon) : undefined,
      }))}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Modal                                                                      */
/* -------------------------------------------------------------------------- */

const MODAL_SIZES: Record<string, OnuModalProps["size"]> = {
  "modal-sm": "sm",
  "modal-lg": "lg",
  "modal-xl": "xl",
  "modal-fullscreen": "full",
}

export interface ModalProps extends Omit<OnuModalProps, "size"> {
  /** Bootstrap size class (`modal-sm`, `modal-lg`, `modal-xl`, `modal-fullscreen`). Default `modal-lg`. */
  modalSizeClass?: string
  size?: OnuModalProps["size"]
}

/** `<x-forms::modal>`. Open it with `trigger`, or control it with `open` / `onOpenChange`. */
export function Modal({ modalSizeClass = "modal-lg", size, ...props }: ModalProps) {
  const resolved =
    size ?? MODAL_SIZES[modalSizeClass] ?? (modalSizeClass.startsWith("modal-fullscreen") ? "full" : "lg")
  return <OnuModal {...props} size={resolved} />
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

export interface StatusProps extends Omit<React.ComponentProps<typeof StatusBadge>, "status" | "color"> {
  label?: React.ReactNode
  /** Bootstrap colour. Default `primary`. */
  color?: string
}

/** `<x-forms::status>`: a status badge. */
export function Status({ label, color = "primary", children, ...props }: StatusProps) {
  return (
    <StatusBadge {...props} status={colorToTone(color)} icon={props.icon ?? false}>
      {children ?? label}
    </StatusBadge>
  )
}

/* -------------------------------------------------------------------------- */
/* Conditional link and wrapper                                               */
/* -------------------------------------------------------------------------- */

/** Resolves `showLink` / `can` / `arg` / `guard` with `FormsProvider authorize`. */
export function useCan(can: string | undefined, arg: unknown, guard: string | null | undefined): boolean {
  const { authorize } = useFormsConfig()
  if (!can) return false
  return authorize ? authorize(can, arg, guard) : false
}

export interface ConditionalLinkProps extends Omit<React.ComponentProps<typeof OnuConditionalLink>, "href" | "when"> {
  /** URL to link to. */
  url: string
  /** Link only when true. Default: the result of `can`, else `false`. */
  showLink?: boolean
  /** Ability to check with `FormsProvider authorize`. */
  can?: string
  arg?: unknown
  guard?: string
  /** Value to show. Default: the bound value of `name`. */
  value?: unknown
  name?: string
  model?: ModelProp
  multiline?: boolean
}

/** `<x-forms::conditional-link>`: a link when allowed, plain text otherwise. */
export function ConditionalLink({
  url,
  showLink,
  can,
  arg,
  guard,
  value,
  name,
  model,
  multiline,
  children,
  ...props
}: ConditionalLinkProps) {
  const target = useBindTarget(model)
  const allowed = useCan(can, arg, guard)
  const shown = value !== undefined ? value : name ? getBoundValue(target, name) : ""
  return (
    <OnuConditionalLink {...props} href={url} when={showLink ?? allowed}>
      {children ?? <FormattedValue value={shown} multiline={multiline} />}
    </OnuConditionalLink>
  )
}

export interface ConditionalWrapperProps extends Omit<React.ComponentProps<"fieldset">, "disabled"> {
  /** The field the condition reads: `#id`, `[name=x]` or a name. */
  enableElem: string
  /** Value(s) that enable the section. */
  enableValue?: unknown
  /** Also hide the section while it is disabled. */
  hideFields?: boolean
  /** Invert: disable the section when the value matches. */
  disable?: boolean
  /** Use the checked state of the `enableElem` checkbox instead of its value. */
  enableCheckbox?: boolean
}

/**
 * `<x-forms::conditional-wrapper>` (js-utilities' `data-enable-section-value` and
 * `data-enable-section-checkbox`): enables, or shows, the fields inside depending
 * on another field. Disabled fields are not submitted.
 */
export function ConditionalWrapper({
  enableElem,
  enableValue,
  hideFields,
  disable,
  enableCheckbox,
  children,
  ...props
}: ConditionalWrapperProps) {
  const watched = useWatchField(enableElem)
  const matcher = enableCheckbox
    ? true
    : Array.isArray(enableValue)
      ? (enableValue as unknown[]).map(String)
      : isNil(enableValue)
        ? undefined
        : String(enableValue)
  return (
    <ConditionalDisplay
      {...props}
      value={enableCheckbox ? watched.checked : watched.value}
      when={matcher}
      not={!!disable}
      action={hideFields ? "show" : "enable"}
    >
      {children}
    </ConditionalDisplay>
  )
}

/* -------------------------------------------------------------------------- */
/* Text entries                                                               */
/* -------------------------------------------------------------------------- */

const InfolistContext = React.createContext(false)

export interface TextEntryProps {
  /** Attribute to read from the bound model; also generates the label. */
  name?: string
  label?: React.ReactNode
  /** Value to show. Default: the bound value of `name`. */
  value?: unknown
  model?: ModelProp
  /** `false` hides the label. Default `true`. */
  showLabel?: boolean
  /** Label beside the value. */
  inline?: boolean
  /** Keep line breaks. */
  multiline?: boolean
  /** Render the value as trusted HTML. */
  wysiwyg?: boolean
  /** Classes for the label (Blade's `inline-entry-label-class`). */
  inlineEntryLabelClass?: string
  /** Classes for the value (Blade's `inline-entry-class`). */
  inlineEntryClass?: string
  className?: string
  /** Custom content for the value (Blade's slot). */
  children?: React.ReactNode
}

/** `<x-forms::text-entry>`: a read-only label and value, formatted like Blade's. */
export function TextEntry({
  name = "",
  label,
  value,
  model,
  showLabel = true,
  inline,
  multiline,
  wysiwyg,
  inlineEntryLabelClass,
  inlineEntryClass,
  className,
  children,
}: TextEntryProps) {
  const { translate } = useFormsTranslation()
  const inList = React.useContext(InfolistContext)
  const target = useBindTarget(model)
  const shown = value !== undefined ? value : name ? getBoundValue(target, name) : ""
  const item = (
    <DescriptionListItem
      label={showLabel ? (label ?? (name ? translate(nameToLabel(name)) : "")) : null}
      classNames={{ label: inlineEntryLabelClass, value: inlineEntryClass }}
      className={inList ? className : undefined}
    >
      {children ?? <FormattedValue value={shown} multiline={multiline} wysiwyg={wysiwyg} />}
    </DescriptionListItem>
  )
  if (inList) return item
  return (
    <DescriptionList layout={inline ? "inline" : "stacked"} divided={false} className={className}>
      {item}
    </DescriptionList>
  )
}

/** `<x-forms::boolean-entry>`: Yes / No, or "-" when the value is `null`. */
export function BooleanEntry({ value, name = "", model, ...props }: Omit<TextEntryProps, "multiline" | "wysiwyg">) {
  const target = useBindTarget(model)
  const raw = value !== undefined ? value : name ? getBoundValue(target, name) : undefined
  return <TextEntry {...props} name={name} model={model} value={isNil(raw) ? null : !!raw && raw !== "0"} />
}

export interface InfolistProps extends Omit<CardProps, "children"> {
  /** Model the entries inside read from. */
  model?: unknown
  /** Label placement of the entries. */
  layout?: "auto" | "stacked" | "inline"
  children?: React.ReactNode
}

/** `<x-forms::infolist>`: a card of `TextEntry`s bound to a model. */
export function Infolist({ model, layout = "auto", children, ...props }: InfolistProps) {
  const list = (
    <InfolistContext.Provider value>
      <DescriptionList layout={layout}>{children}</DescriptionList>
    </InfolistContext.Provider>
  )
  return <Card {...props}>{model !== undefined ? <Model model={model}>{list}</Model> : list}</Card>
}
