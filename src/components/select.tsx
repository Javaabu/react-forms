"use client"

import * as React from "react"
import {
  ApiSelect,
  MultiSelect,
  QuickCreateSelect,
  SearchableSelect,
  Select as OnuSelect,
  type ChoiceOption,
} from "@javaabu/onu"

import { getBoundValue, useBindTarget, useOldInput } from "../context/binding"
import { useFormsTranslation } from "../context/forms-provider"
import {
  parseSelector,
  useFlag,
  useFlagFor,
  useLink,
  useLinkedFrom,
  usePublishField,
  useWatchField,
} from "../context/registry"
import { isNil, toFormString } from "../support/data"
import {
  normalizeOptions,
  optionsFromChildren,
  relationValue,
  toSelectedValues,
  type OptionFields,
  type OptionsInput,
} from "../support/options"
import { before, bracketsToDots } from "../support/str"
import { FieldWrapper, splitFieldProps, useFieldNames, type FieldProps, type PlaceholderProps } from "./field"
import { Hidden } from "./inputs"
import { useCascadeOptions } from "./select-cascade"
import { useSyncedState } from "../support/use-synced-state"

export interface SelectProps extends FieldProps, PlaceholderProps, OptionFields {
  /** Options: a key → label object, a PHP list, ordered pairs, records or `ChoiceOption`s. */
  options?: OptionsInput
  /** `<option>` elements, used when `options` is empty (Blade's slot). */
  children?: React.ReactNode
  /** Several values; submits `name[]` and a `sync_<name>` field. */
  multiple?: boolean
  /** Read the value from a relation: `country` → `country_id`, `tags` → the tags' keys. */
  relation?: boolean
  /** Don't add the `sync_<name>` hidden input of multi-selects. */
  excludeSyncField?: boolean
  /** Name of the sync input. Default `sync_<name>`. */
  syncFieldName?: string
  /** Let users add values that are not in the list. */
  tags?: boolean
  /** Controlled value (`string[]` when `multiple`). */
  value?: string | string[] | null
  onValueChange?: (value: string | string[] | null) => void
  /** Show a clear button. Default: when there is a placeholder and the field is optional. */
  clearable?: boolean
  className?: string
}

export interface Select2Props extends SelectProps {
  /** Show a clear button. Default `true` (with "Nothing Selected" as the placeholder). */
  allowClear?: boolean
  /** Hide the search box (`select2`'s `minimumResultsForSearch: Infinity`). */
  hideSearch?: boolean
  /** Search on the server as the user types (needs `ajaxUrl`). */
  isAjax?: boolean
  /**
   * The API endpoint. With `isAjax`, it is searched with `filter[search]`. On a
   * cascade child it loads the options for the parent's value (`:value` is replaced).
   * An object of URLs (or its JSON) picks the URL by the `ajaxChild` parent's value.
   */
  ajaxUrl?: string | Record<string, string>
  /** Key of `ajaxUrl` to use before a parent picks one. */
  selectedUrl?: string
  /** Fields that depend on this one: `#id` or a name (cascading selects). */
  child?: string
  /** A select whose `ajaxUrl` is chosen by this field's value: `#id` or a name. */
  ajaxChild?: string
  /** The field this one depends on: `#id` or a name. The React-style alternative to the parent's `child`. */
  parent?: string
  /** Request filter for the parent's value: sends `filter[<filterField>]=<value>`. */
  filterField?: string
  /** An input (`#id` or a name) shown instead of this select when the parent's value has no options. */
  fallback?: string
  /** Minimum characters before an `isAjax` search runs. */
  minChars?: number
}

/** The selected value(s), in `Select`'s order: old input → `default` → bound value. */
function useInitialSelection(props: SelectProps): string[] {
  const target = useBindTarget(props.model)
  const old = useOldInput()
  const inputName = bracketsToDots(before(props.name, "[]"))
  const bound = props.relation
    ? relationValue(target, inputName, !!props.multiple, props.idField)
    : getBoundValue(target, inputName)
  const fallback = isNil(props.default) ? bound : props.default
  const value = old.hasKey(inputName) ? old.get(inputName) : fallback
  return toSelectedValues(value, props.idField)
}

function parseUrls(urls: Select2Props["ajaxUrl"]): string | Record<string, string> | undefined {
  if (typeof urls !== "string") return urls
  const s = urls.trim()
  if (s.startsWith("{")) {
    try {
      return JSON.parse(s) as Record<string, string>
    } catch {
      return urls
    }
  }
  return urls
}

function SelectField({ select2, ...props }: Select2Props & { select2: boolean }) {
  const { t } = useFormsTranslation()
  const { field, rest } = splitFieldProps(props)
  const {
    options: optionsProp,
    children,
    multiple = false,
    relation: _relation,
    excludeSyncField,
    syncFieldName,
    tags,
    nameField,
    idField,
    value: valueProp,
    onValueChange,
    clearable: clearableProp,
    allowClear = select2,
    hideSearch,
    isAjax,
    ajaxUrl,
    selectedUrl,
    child,
    ajaxChild,
    parent: parentProp,
    filterField,
    fallback,
    minChars,
    placeholder: placeholderProp,
    showPlaceholder,
    className,
  } = rest

  const placeholder = placeholderProp || (select2 && allowClear ? t("nothingSelected") : undefined)
  const names = useFieldNames({ ...field, placeholder, showPlaceholder })
  const id = names.id
  const initial = useInitialSelection(props)
  const initialKey = initial.join("\u0000")
  const [inner, setInner] = useSyncedState<string[]>(initial, initialKey)
  const selected = valueProp === undefined ? inner : toSelectedValues(valueProp)

  const setSelected = (next: string[]) => {
    setInner(next)
    onValueChange?.(multiple ? next : (next[0] ?? null))
  }

  // Relations set by other fields (`child="#this"`, `ajaxChild="#this"`) or by this one (`parent`).
  useLink("child", child, id ? `#${id}` : field.name)
  useLink("ajax-child", ajaxChild, id ? `#${id}` : field.name)
  const urls = parseUrls(ajaxUrl)
  const linkedParent = useLinkedFrom("child", id, field.name)
  const linkedAjaxParent = useLinkedFrom("ajax-child", id, field.name)
  const dynamicUrls = urls && typeof urls === "object" ? urls : undefined
  const cascadeParent = !isAjax && typeof urls === "string" ? (parentProp ?? linkedParent) : undefined
  const urlParent = dynamicUrls ? (parentProp ?? linkedAjaxParent) : undefined
  const watchedCascade = useWatchField(cascadeParent)
  const watchedUrlParent = useWatchField(urlParent)

  const normalized = normalizeOptions(optionsProp, { nameField, idField })
  const staticOptions = normalized.length ? normalized : optionsFromChildren(children)

  const cascade = useCascadeOptions({
    enabled: !!cascadeParent,
    url: typeof urls === "string" ? urls : undefined,
    parentValue: watchedCascade.value,
    filterField,
    nameField,
    idField,
    initialOptions: staticOptions,
  })

  // A cascade child whose parent changed loses a value that is no longer in its list.
  React.useEffect(() => {
    if (!cascade.active || cascade.loading) return
    const allowed = new Set(cascade.options.map((o) => o.value))
    const kept = selected.filter((v) => allowed.has(v))
    if (kept.length !== selected.length) setSelected(kept)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cascade.options, cascade.loading, cascade.active])

  // Dynamic URL (`ajaxChild`): the parent's value picks the URL, and a new URL clears the value.
  const urlKey = urlParent ? toFormString(watchedUrlParent.value) || undefined : selectedUrl
  const dynamicUrl = dynamicUrls ? (urlKey && dynamicUrls[urlKey]) || Object.values(dynamicUrls)[0] : undefined
  const previousUrlKey = React.useRef(urlKey)
  React.useEffect(() => {
    if (previousUrlKey.current !== urlKey && previousUrlKey.current !== undefined) setSelected([])
    previousUrlKey.current = urlKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey])

  // Fallback input: shown instead of this select when the parent's value has no options.
  const parentState = useFlagFor(
    "select-state",
    cascadeParent ? parseSelector(cascadeParent).id : undefined,
    cascadeParent ? parseSelector(cascadeParent).name : undefined,
  ) as { fallbackActive?: boolean } | undefined
  const hasParentValue = cascade.hasParentValue
  const showFallback =
    !!fallback && cascade.active && (!hasParentValue || (!cascade.loading && !cascade.options.length))
  const fallbackActive = showFallback && (hasParentValue || !!parentState?.fallbackActive)
  const fallbackFlag = React.useMemo(() => ({ active: fallbackActive }), [fallbackActive])
  useFlag("fallback", fallback, fallbackFlag)
  const ownState = React.useMemo(() => ({ fallbackActive }), [fallbackActive])
  useFlag("select-state", id ? `#${id}` : field.name, ownState)

  const listed = cascade.active ? cascade.options : staticOptions
  const knownValues = new Set(listed.map((o) => o.value))
  // Tags: values that are not in the list (typed earlier, or from old input) stay selectable.
  const options = tags
    ? [...listed, ...selected.filter((v) => !knownValues.has(v)).map((v) => ({ value: v, label: v }))]
    : listed

  const disabled =
    field.disabled ||
    (cascade.active && (!hasParentValue || cascade.loading || showFallback)) ||
    (!!urlParent && !urlKey) ||
    undefined

  usePublishField({ id, name: field.name, kind: "value", value: multiple ? selected : (selected[0] ?? ""), disabled })

  const clearable = clearableProp ?? (select2 ? allowClear : !!placeholder) ?? false
  const shownPlaceholder = cascade.loading ? t("loading") : cascade.error ? t("errorLoadingOptions") : names.placeholder
  const syncName = syncFieldName || `sync_${bracketsToDots(before(field.name, "[]"))}`
  const showSync = multiple && !excludeSyncField && !disabled

  const common = {
    id,
    name: field.name,
    required: field.required || undefined,
    disabled,
    placeholder: shownPlaceholder,
    className,
  }

  let control: React.ReactNode
  if (isAjax && (dynamicUrl || typeof urls === "string")) {
    const valueKey = idField || "id"
    const labelKey = nameField || "name"
    const apiProps = {
      ...common,
      url: (dynamicUrl ?? urls) as string,
      initialOptions: staticOptions,
      valueKey,
      labelKey,
      searchParam: "filter[search]",
      params: { fields: `${valueKey},${labelKey}`, include: "", append: "" },
      minChars,
      clearable,
      dependsOn: urlKey,
    }
    control = multiple ? (
      <ApiSelect {...apiProps} multiple value={selected} onValueChange={(v: string[]) => setSelected(v)} />
    ) : (
      <ApiSelect
        {...apiProps}
        value={selected[0] ?? null}
        onValueChange={(v: string | null) => setSelected(v ? [v] : [])}
      />
    )
  } else if (multiple) {
    const multiProps = {
      ...common,
      options,
      value: selected,
      onValueChange: (v: string[]) => setSelected(v),
      clearable,
    }
    control = tags ? (
      <QuickCreateSelect
        {...multiProps}
        multiple
        onCreate={(label: string): ChoiceOption => ({ value: label, label })}
      />
    ) : (
      <MultiSelect {...multiProps} />
    )
  } else if (tags) {
    control = (
      <QuickCreateSelect
        {...common}
        options={options}
        value={selected[0] ?? null}
        onValueChange={(v: string | null) => setSelected(v ? [v] : [])}
        clearable={clearable}
        onCreate={(label: string): ChoiceOption => ({ value: label, label })}
      />
    )
  } else if (!select2 || hideSearch) {
    control = (
      <OnuSelect
        {...common}
        options={options}
        value={selected[0] ?? ""}
        onValueChange={(v: string) => setSelected(v ? [v] : [])}
        clearable={clearable && !field.required}
      />
    )
  } else {
    control = (
      <SearchableSelect
        {...common}
        options={options}
        value={selected[0] ?? null}
        onValueChange={(v: string | null) => setSelected(v ? [v] : [])}
        clearable={clearable}
      />
    )
  }

  return (
    <>
      <div hidden={showFallback || undefined} className={showFallback ? undefined : "contents"}>
        <FieldWrapper {...field} id={id} label={names.label} disabled={disabled}>
          {control}
        </FieldWrapper>
      </div>
      {showSync ? <Hidden name={syncName} value="1" model={false} /> : null}
    </>
  )
}

/** `<x-forms::select>`: a select bound to the model, with Laravel relation support. */
export function Select(props: SelectProps) {
  return <SelectField {...props} select2={false} />
}

/**
 * `<x-forms::select2>`: a searchable select. Supports server search (`isAjax`),
 * cascading selects (`child` / `parent` + `filterField`), dynamic URLs
 * (`ajaxChild`), fallback inputs and tags.
 */
export function Select2(props: Select2Props) {
  return <SelectField {...props} select2 />
}
