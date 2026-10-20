"use client"

import * as React from "react"
import {
  ActionMenu,
  Button as OnuButton,
  ButtonGroup as OnuButtonGroup,
  Checkbox as OnuCheckbox,
  EmptyState,
  Icon,
  Pagination as OnuPagination,
  Table as OnuTable,
  TableBody,
  TableCell as OnuTableCell,
  TableHead,
  TableHeader,
  TableRow as OnuTableRow,
  cn,
  type LaravelPaginationMeta,
  type LaravelResourceCollection,
} from "@javaabu/onu"

import { getBoundValue, Model, useBindTarget, useBoundModel, type ModelProp } from "../context/binding"
import { useFormsTranslation, useSetting } from "../context/forms-provider"
import { isNil, toFormString } from "../support/data"
import { nameToLabel } from "../support/str"
import { Button, LinkButton } from "./buttons"
import { useCan } from "./display"
import { Form, type FormProps } from "./form"
import { FormattedValue } from "./format"
import { Hidden, Input } from "./inputs"
import { Select2 } from "./select"

/** The current URL's query string (empty on the server). */
function currentQuery(): URLSearchParams {
  return new URLSearchParams(typeof window === "undefined" ? "" : window.location.search)
}

/** Submits `form` with an extra field, like a clicked `<button name value>`. */
function submitWith(form: HTMLFormElement | null | undefined, name: string, value: string) {
  if (!form) return
  const input = document.createElement("input")
  input.type = "hidden"
  input.name = name
  input.value = value
  form.appendChild(input)
  form.requestSubmit()
  input.remove()
}

/* -------------------------------------------------------------------------- */
/* Table                                                                      */
/* -------------------------------------------------------------------------- */

interface TableContextValue {
  model: string
  noCheckbox: boolean
  filterId: string
  selected: ReadonlySet<string>
  toggle: (id: string, checked: boolean) => void
  register: (id: string) => () => void
}

const TableContext = React.createContext<TableContextValue | null>(null)

export interface TableProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Name of the rows' checkboxes (`<model>[]`) and of the select-all group. */
  model?: string
  striped?: boolean
  /** Don't wrap the table in the bulk actions form. */
  noBulk?: boolean
  /** No row checkboxes. */
  noCheckbox?: boolean
  noPagination?: boolean
  /** Classes for the `<table>`. */
  tableClass?: string
  /** Id of the filter form that sortable headings submit. Default `filter`. */
  filterId?: string
  /** Bulk actions form content, e.g. `<BulkActions>` (Blade's `bulkForm` slot). */
  bulkForm?: React.ReactNode
  /** Action of the bulk actions form. */
  bulkFormAction?: string
  /** Extra props for the bulk actions form. */
  bulkFormProps?: Omit<FormProps, "action" | "children">
  beforeTable?: React.ReactNode
  beforeHeaders?: React.ReactNode
  /** Heading cells (`TableHeading`). */
  headers?: React.ReactNode
  afterHeaders?: React.ReactNode
  /** Rows (`TableRow`). The children are used when it is not set. */
  rows?: React.ReactNode
  afterTbody?: React.ReactNode
  pagination?: React.ReactNode
  children?: React.ReactNode
}

/**
 * `<x-forms::table>`: a listing table with select-all checkboxes (js-utilities'
 * `selectAllCheckbox`), sortable headings that submit the filter form
 * (`sortable`), and an optional bulk actions form around it.
 */
export function Table({
  model = "",
  striped,
  noBulk,
  noCheckbox = false,
  noPagination,
  tableClass,
  filterId = "filter",
  bulkForm,
  bulkFormAction,
  bulkFormProps,
  beforeTable,
  beforeHeaders,
  headers,
  afterHeaders,
  rows,
  afterTbody,
  pagination,
  children,
  className,
  ...props
}: TableProps) {
  const { t } = useFormsTranslation()
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set())
  const [all, setAll] = React.useState<Set<string>>(() => new Set())

  const ctx = React.useMemo<TableContextValue>(
    () => ({
      model,
      noCheckbox,
      filterId,
      selected,
      toggle: (id, checked) =>
        setSelected((prev) => {
          const next = new Set(prev)
          if (checked) next.add(id)
          else next.delete(id)
          return next
        }),
      register: (id) => {
        setAll((prev) => new Set(prev).add(id))
        return () =>
          setAll((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
      },
    }),
    [model, noCheckbox, filterId, selected],
  )

  const allChecked = all.size > 0 && [...all].every((id) => selected.has(id))
  const someChecked = !allChecked && [...all].some((id) => selected.has(id))
  const toggleAll = (checked: boolean) => setSelected(checked ? new Set(all) : new Set())

  const table = (
    <TableContext.Provider value={ctx}>
      {beforeTable}
      <OnuTable
        data-form-sortable={`#${filterId}`}
        className={cn(striped && "[&_tbody_tr:nth-child(odd)]:bg-muted/50", tableClass)}
      >
        <TableHeader>
          {beforeHeaders}
          <OnuTableRow>
            {noCheckbox ? null : (
              <TableHead className="w-10">
                <OnuCheckbox
                  aria-label={t("selectAll")}
                  checked={allChecked ? true : someChecked ? "indeterminate" : false}
                  onCheckedChange={(state) => toggleAll(state === true)}
                />
              </TableHead>
            )}
            {headers}
          </OnuTableRow>
          {afterHeaders}
        </TableHeader>
        <TableBody>{rows ?? children}</TableBody>
        {afterTbody}
      </OnuTable>
    </TableContext.Provider>
  )

  return (
    <>
      <div data-slot="forms-table" className={cn("w-full overflow-x-auto", className)} {...props}>
        {!noBulk && bulkForm ? (
          <Form {...bulkFormProps} action={bulkFormAction} summary={bulkFormProps?.summary ?? false}>
            <div className="p-4">{bulkForm}</div>
            {table}
          </Form>
        ) : (
          table
        )}
      </div>
      {noPagination ? null : pagination}
    </>
  )
}

export interface TableRowProps extends React.ComponentProps<"tr"> {
  /** Checkbox name: submits `<name>[]`. Default: the table's `model`. */
  name?: string
  rowId?: string
  /** Model the cells read from. */
  model?: unknown
  /** Value of the row checkbox. Default: `model.id`. */
  modelId?: string | number
  noCheckbox?: boolean
  disableCheckbox?: boolean
}

/** `<x-forms::table.row>`: a row with a selection checkbox, bound to its model. */
export function TableRow({
  name,
  rowId,
  model,
  modelId,
  noCheckbox,
  disableCheckbox,
  children,
  ...props
}: TableRowProps) {
  const { t } = useFormsTranslation()
  const table = React.useContext(TableContext)
  const bound = useBoundModel()
  const target = model ?? bound
  const key = toFormString(modelId ?? getBoundValue(target, "id"))
  const checkboxName = name || table?.model || ""
  const hideCheckbox = noCheckbox ?? table?.noCheckbox ?? false
  const generated = React.useId().replace(/:/g, "")
  const id = rowId || `${checkboxName ? `${checkboxName}-` : ""}${key || generated}-row`
  const register = table?.register

  React.useEffect(() => {
    if (!register || hideCheckbox || disableCheckbox || !key) return
    return register(key)
  }, [register, hideCheckbox, disableCheckbox, key])

  const row = (
    <OnuTableRow id={id} data-state={table?.selected.has(key) ? "selected" : undefined} {...props}>
      {hideCheckbox ? null : (
        <OnuTableCell className="w-10">
          <OnuCheckbox
            id={`${id}-check`}
            name={`${checkboxName}[]`}
            value={key}
            disabled={disableCheckbox}
            aria-label={t("selectRow", { name: key })}
            checked={table ? table.selected.has(key) : undefined}
            onCheckedChange={(state) => table?.toggle(key, state === true)}
          />
        </OnuTableCell>
      )}
      {children}
    </OnuTableRow>
  )

  return model !== undefined ? <Model model={model}>{row}</Model> : row
}

export interface TableCellProps extends React.ComponentProps<"td"> {
  /** Attribute of the row's model to show. */
  name?: string
  /** Column label, used on small screens (`data-col`). Default: generated from `name`. */
  label?: string
  showLabel?: boolean
  value?: unknown
  model?: ModelProp
  multiline?: boolean
}

/** `<x-forms::table.cell>`: a cell showing a formatted value of the row's model. */
export function TableCell({
  name = "",
  label,
  showLabel = true,
  value,
  model,
  multiline,
  children,
  ...props
}: TableCellProps) {
  const { translate } = useFormsTranslation()
  const target = useBindTarget(model)
  const shown = value !== undefined ? value : name ? getBoundValue(target, name) : ""
  return (
    <OnuTableCell data-col={showLabel && name ? (label ?? translate(nameToLabel(name))) : undefined} {...props}>
      {children ?? <FormattedValue value={shown} multiline={multiline} arrays="inline" />}
    </OnuTableCell>
  )
}

export interface TableHeadingProps extends Omit<React.ComponentProps<"th">, "children"> {
  label?: React.ReactNode
  /** Sort field. Default: `name`. */
  sortable?: string
  name?: string
  children?: React.ReactNode
}

/**
 * `<x-forms::table.heading>`: a column heading. Sortable headings set the filter
 * form's `orderby` / `order` and submit it (or update the URL without a form).
 */
export function TableHeading({ label, colSpan, sortable, name, children, className, ...props }: TableHeadingProps) {
  const { t } = useFormsTranslation()
  const table = React.useContext(TableContext)
  const field = sortable || name
  const query = currentQuery()
  const active = !!field && query.get("orderby") === field
  const order = (query.get("order") || "ASC").toUpperCase()
  const content = children ?? label

  if (!field) {
    return (
      <TableHead colSpan={colSpan} className={className} {...props}>
        {content}
      </TableHead>
    )
  }

  const sort = () => {
    const next = active && order === "ASC" ? "DESC" : "ASC"
    const form = document.getElementById(table?.filterId ?? "filter")
    if (form instanceof HTMLFormElement) {
      const set = (n: string, v: string) => {
        let input = form.querySelector<HTMLInputElement>(`[name="${n}"]`)
        if (!input) {
          input = document.createElement("input")
          input.type = "hidden"
          input.name = n
          form.appendChild(input)
        }
        input.value = v
      }
      set("orderby", field)
      set("order", next)
      form.requestSubmit()
    } else {
      const params = currentQuery()
      params.set("orderby", field)
      params.set("order", next)
      window.location.search = params.toString()
    }
  }

  return (
    <TableHead
      colSpan={colSpan}
      aria-sort={active ? (order === "DESC" ? "descending" : "ascending") : "none"}
      data-sort-field={field}
      className={className}
      {...props}
    >
      <button
        type="button"
        onClick={sort}
        aria-label={typeof content === "string" ? t("sortBy", { label: content }) : undefined}
        className="gap-1 font-medium inline-flex items-center hover:text-foreground"
      >
        {content}
        <Icon
          name={active ? (order === "DESC" ? "chevron-down" : "chevron-up") : "chevrons-up-down"}
          size="sm"
          className={cn(!active && "opacity-40")}
        />
      </button>
    </TableHead>
  )
}

export interface TableEmptyRowProps extends React.ComponentProps<"td"> {
  /** Number of data columns (the checkbox column is added). */
  columns?: number
  noCheckbox?: boolean
}

/** `<x-forms::table.empty-row>`: one cell across the table, e.g. for `NoItems`. */
export function TableEmptyRow({ columns = 1, noCheckbox, children, ...props }: TableEmptyRowProps) {
  const table = React.useContext(TableContext)
  const hide = noCheckbox ?? table?.noCheckbox ?? false
  return (
    <OnuTableRow>
      <OnuTableCell colSpan={columns + (hide ? 0 : 1)} {...props}>
        {children}
      </OnuTableCell>
    </OnuTableRow>
  )
}

/* -------------------------------------------------------------------------- */
/* Bulk actions, filter, per page, search                                     */
/* -------------------------------------------------------------------------- */

export interface BulkActionsProps {
  /** Actions: value → label (`{ delete: "Delete", publish: "Publish" }`). */
  actions: Record<string, string>
  /** The listed model (kept for parity with Blade). */
  model?: string
  className?: string
}

/** `<x-forms::bulk-actions>`: an `action` select, an Apply button and the `redirect` back to this page. */
export function BulkActions({ actions, className }: BulkActionsProps) {
  const { t } = useFormsTranslation()
  if (!Object.keys(actions).length) return null
  return (
    <div className={cn("gap-2 flex flex-wrap items-end", className)}>
      <div className="w-full max-w-xs">
        <Select2
          name="action"
          options={actions}
          placeholder={t("bulkAction")}
          label={t("bulkAction")}
          showLabel={false}
          hideSearch
          required
          model={false}
        />
      </div>
      <Button type="submit" color="warning">
        {t("apply")}
      </Button>
      <Hidden name="redirect" value={typeof window === "undefined" ? "" : window.location.href} model={false} />
    </div>
  )
}

/** `<x-forms::filter>`: the filter card, with the `orderby` / `order` fields sortable headings set. */
export function Filter({ children, className }: { children?: React.ReactNode; className?: string }) {
  const query = currentQuery()
  return (
    <div data-slot="forms-filter" className={cn("p-4 rounded-lg border bg-card text-card-foreground", className)}>
      {children}
      <Hidden name="orderby" default={query.get("orderby") ?? undefined} />
      <Hidden name="order" default={query.get("order") ?? undefined} />
    </div>
  )
}

export interface FilterSubmitProps {
  /** URL of the "Clear" link. */
  cancelUrl: string
  /**
   * Export button(s), submitted as `download`: `true` (value `1`), a format, or a
   * format → label object for an export menu.
   */
  export?: boolean | string | string[] | Record<string, string>
  /** Before the Filter button. */
  before?: React.ReactNode
  /** Before the Clear link. */
  after?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

/** `<x-forms::filter-submit>`: Filter, Export and Clear. */
export function FilterSubmit({
  cancelUrl,
  export: exportProp = false,
  before,
  after,
  children,
  className,
}: FilterSubmitProps) {
  const { t } = useFormsTranslation()
  const id = React.useId()
  const exports =
    typeof exportProp === "string"
      ? { [exportProp]: exportProp }
      : Array.isArray(exportProp)
        ? Object.fromEntries(exportProp.map((e, i) => [String(i), e]))
        : exportProp && typeof exportProp === "object"
          ? exportProp
          : null
  const keys = exports ? Object.keys(exports) : []

  return (
    <div id={id} className={cn("gap-2 flex flex-wrap items-center", className)}>
      {before}
      <Button type="submit" color="primary">
        {t("filter")}
      </Button>
      {exports && keys.length ? (
        <OnuButtonGroup>
          <OnuButton type="submit" variant="secondary" name="download" value={keys[0]} startIcon="download">
            {t("export")}
          </OnuButton>
          {keys.length > 1 ? (
            <ActionMenu
              label={t("export")}
              trigger={
                <OnuButton type="button" variant="secondary" size="icon" aria-label={t("export")}>
                  <Icon name="chevron-down" />
                </OnuButton>
              }
              items={keys.map((key) => ({
                label: exports[key],
                onSelect: () => submitWith(document.getElementById(id)?.closest("form"), "download", key),
              }))}
            />
          ) : null}
        </OnuButtonGroup>
      ) : exportProp === true ? (
        <OnuButton type="submit" variant="secondary" name="download" value="1" startIcon="download">
          {t("export")}
        </OnuButton>
      ) : null}
      {after}
      <LinkButton url={cancelUrl} color="light">
        {t("clear")}
      </LinkButton>
      {children}
    </div>
  )
}

export interface PerPageProps {
  /** Page sizes: a list, or value → label. */
  amounts?: number[] | Record<string, string | number>
  /** Current size. Default: `per_page` in the URL, else the `per_page` setting. */
  perPage?: number | string
  label?: React.ReactNode
  showLabel?: boolean
  className?: string
}

/** `<x-forms::per-page>`: the `per_page` select of a filter form. */
export function PerPage({ amounts = [10, 20, 50, 100, 500], perPage, label, showLabel, className }: PerPageProps) {
  const setting = useSetting<number>("per_page")
  const selected = toFormString(perPage ?? currentQuery().get("per_page") ?? setting ?? "")
  const options: Array<[string, string]> = Array.isArray(amounts)
    ? amounts.map((a) => [String(a), String(a)])
    : Object.entries(amounts).map(([k, v]) => [k, String(v)])
  if (selected && !options.some(([k]) => k === selected)) options.push([selected, selected])
  return (
    <Select2
      name="per_page"
      options={options}
      default={selected}
      model={false}
      label={label}
      showLabel={showLabel}
      allowClear={false}
      hideSearch
      formGroupClass={className}
    />
  )
}

export interface SearchFormProps extends Omit<FormProps, "children" | "method" | "model"> {
  /** Search field name. Default `search`. */
  name?: string
  placeholder?: string
  method?: string
  /** Values for the field. Default: the URL query. */
  model?: unknown
}

/** `<x-forms::search-form>`: a GET form with one search field. */
export function SearchForm({
  name = "search",
  placeholder,
  method = "GET",
  model,
  className,
  ...props
}: SearchFormProps) {
  const { t } = useFormsTranslation()
  const values = model ?? Object.fromEntries(currentQuery())
  return (
    <Form {...props} method={method} model={values} summary={false} className={cn("search", className)}>
      <Input name={name} type="search" placeholder={placeholder ?? t("searchFormPlaceholder")} showLabel={false} />
    </Form>
  )
}

/* -------------------------------------------------------------------------- */
/* No items, pagination                                                       */
/* -------------------------------------------------------------------------- */

export interface NoItemsProps extends Omit<React.ComponentProps<typeof EmptyState>, "title" | "action" | "icon"> {
  /** URL of the "Create New" button. Default `#`. */
  createAction?: string
  /** The listed model (class name or object), checked with `authorize("create", model)`. */
  model?: unknown
  icon?: React.ReactNode
  /** Plural name used in the message. Default "items". */
  modelType?: string
  /** Show the create button. Default: `authorize("create", model)`. */
  showCreate?: boolean
  title?: React.ReactNode
  message?: React.ReactNode
  /** Replaces the create button (Blade's slot). */
  children?: React.ReactNode
}

/** `<x-forms::no-items>`: the empty state of a listing. */
export function NoItems({
  createAction = "#",
  model,
  icon,
  modelType,
  showCreate,
  title,
  message,
  children,
  ...props
}: NoItemsProps) {
  const { t } = useFormsTranslation()
  const allowed = useCan(model ? "create" : undefined, model, undefined)
  const create = showCreate ?? allowed
  return (
    <EmptyState
      {...props}
      icon={
        icon === undefined ? undefined : typeof icon === "string" && icon.includes(" ") ? (
          <i className={icon} aria-hidden="true" />
        ) : (
          icon
        )
      }
      title={isNil(title) ? t("noItemsTitle") : title}
      description={isNil(message) ? t("noItemsMessage", { model_type: modelType ?? t("items") }) : message}
      action={
        create
          ? (children ?? (
              <LinkButton url={createAction} startIcon="plus">
                {t("createNew")}
              </LinkButton>
            ))
          : undefined
      }
    />
  )
}

interface CursorPaginator {
  next_page_url?: string | null
  prev_page_url?: string | null
  next_cursor?: string | null
  prev_cursor?: string | null
}

export interface PaginationProps extends Omit<React.ComponentProps<typeof OnuPagination>, "paginator"> {
  /** A Laravel paginator, API resource collection or cursor paginator, as JSON. */
  paginator: LaravelPaginationMeta | LaravelResourceCollection | CursorPaginator
}

/**
 * The pagination partials: numbered pages for length-aware paginators, previous /
 * next for cursor paginators. Pages are links that keep the rest of the query string.
 */
export function Pagination({ paginator, getPageHref, onPageChange, ...props }: PaginationProps) {
  const { t } = useFormsTranslation()
  const p = paginator as CursorPaginator & Partial<LaravelPaginationMeta> & { meta?: unknown }
  const isCursor = !p.meta && p.current_page === undefined && ("next_cursor" in p || "next_page_url" in p)

  if (isCursor) {
    return (
      <nav aria-label={t("pagination")} className="gap-2 flex justify-between">
        <LinkButton
          url={p.prev_page_url ?? undefined}
          color="light"
          disabled={!p.prev_page_url}
          startIcon="chevron-left"
        >
          {t("previous")}
        </LinkButton>
        <LinkButton
          url={p.next_page_url ?? undefined}
          color="light"
          disabled={!p.next_page_url}
          endIcon="chevron-right"
        >
          {t("next")}
        </LinkButton>
      </nav>
    )
  }

  const href =
    getPageHref ??
    (onPageChange
      ? undefined
      : (page: number) => {
          const params = currentQuery()
          params.set("page", String(page))
          return `?${params.toString()}`
        })

  return (
    <OnuPagination
      {...props}
      paginator={paginator as LaravelPaginationMeta | LaravelResourceCollection}
      getPageHref={href}
      onPageChange={onPageChange}
    />
  )
}
