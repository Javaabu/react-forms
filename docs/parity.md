---
title: Parity with javaabu/forms
sidebar_position: 1.6
---

`@javaabu/forms` (React) and [`javaabu/forms`](https://github.com/Javaabu/forms) v2 (Blade) have the same components, attributes, value precedence, ids, labels, errors and strings, so a form moves between a Blade view and an Inertia React page without being redesigned. This page is the React side of the matrix. The Blade side is [`docs/parity.md` in javaabu/forms](https://github.com/Javaabu/forms/blob/next-gen/docs/parity.md). Decisions were settled in [react-forms#18](https://github.com/Javaabu/react-forms/issues/18).

**Naming.** Blade components are kebab-case and React components PascalCase (`<x-forms::link-button>` ↔ `<LinkButton>`). Blade attributes are kebab-case and React props camelCase (`show-label` ↔ `showLabel`). A Blade named slot is a React prop of the same name (`<x-slot:help>` ↔ `help`), and the default slot is `children`. Blade's attribute bag (`id`, `class`, `disabled`, `min`, …) is the matching React prop (`className` for `class`).

**Status:** ✅ same in both · ≠ intentional difference · ⚛️ React only · 🅱️ Blade only

# Components

| React | Blade | Status | Notes |
| --- | --- | --- | --- |
| `Form` | `form` | ✅ | `model`, `method` (spoofed), `files`, `action`, `summary`, `summaryTitle`, `focusOnError`, `errorBag`. React's submission props are ⚛️ (below). |
| — | `form-open`, `form-close` | 🅱️ | For forms split across partials. |
| `Model` | `@model` / `@endmodel` | ✅ | |
| `OldInput`, `FormsProvider` | — | ⚛️ | React context. Blade reads old input, errors and config from Laravel. |
| `FormGroup`, `Label`, `LabelRequired`, `InputHelp`, `Errors` | `form-group`, `label`, `label-required`, `input-help`, `errors` | ✅ | `Errors` takes `firstOnly` (default `true`) and `bag`. |
| `ErrorSummary` | `error-summary` | ✅ | New in v2. `errors`, `bag`, `title`, `labels`. |
| `Input`, `Text`, `Email`, `Password`, `Number`, `Tel`, `Url`, `Hidden`, `Latitude`, `Longitude` | same names | ✅ | |
| `Textarea` | `textarea` | ✅ | `wysiwyg`, `rows`, `autoResize`, `thaana`. |
| `Wysiwyg` | `wysiwyg` | ✅ | React uses the adapter's editor (Onu: Tiptap), Blade TinyMCE. Both submit HTML. |
| `Checkbox`, `Radio` | `checkbox`, `radio` | ✅ | |
| `Date`, `Datetime`, `Time` | `date`, `datetime`, `time` | ✅ | |
| `Select`, `Select2` | `select`, `select2` | ✅ | |
| `File`, `FileUpload`, `Image`, `ImageUpload` | `file`, `file-upload`, `image`, `image-upload` | ✅ | |
| `MapInput` | `map-input` | ✅ | |
| `ConditionalWrapper`, `ConditionalLink` | `conditional-wrapper`, `conditional-link` | ✅ | |
| `Button`, `Submit`, `LinkButton`, `ButtonGroup` | `button`, `submit`, `link-button`, `button-group` | ✅ | `color`, `size`, `startIcon`, `endIcon` (Blade's icon names, [#21](https://github.com/Javaabu/react-forms/issues/21)), `loading`; `LinkButton` `disabled`. |
| `Alert` | `alert` | ✅ | |
| `Card`, `CardHeader`, `CardTitle`, `CardSubtitle`, `CardFooter` | `card`, `card.header`, `card.title`, `card.subtitle`, `card.footer` | ✅ | |
| `Accordion`, `AccordionItem` | `accordion`, `accordion.item` | ✅ | Named slots of `accordion` are React's `slots` prop. |
| — | `accordion.header`, `accordion.collapse` | 🅱️ | Parts for custom item markup. |
| `Tabs`, `TabsPane`, `NavTabs` | `tabs`, `tabs.pane`, `nav-tabs` | ✅ | Named slots of `tabs` are React's `slots` prop. |
| — | `tabs.nav-item` | 🅱️ | Part of `tabs`. |
| `Modal` | `modal` | ✅ | `modalSizeClass`, `size`, `description`, `title`, `footer`. |
| `Status` | `status` | ✅ | |
| `TextEntry`, `BooleanEntry`, `Infolist` | `text-entry`, `boolean-entry`, `infolist` | ✅ | |
| `FormattedValue` | `formatted-value` | ✅ | New in v2. |
| `Table`, `TableRow`, `TableCell`, `TableHeading`, `TableEmptyRow` | `table`, `table.row`, `table.cell`, `table.heading`, `table.empty-row` | ✅ | `Table`'s named slots (`bulkForm`, `headers`, `beforeTable`, …) are props. |
| `useTableSelection()` | — | ⚛️ | The table's selection for content inside it (`bulkForm`): selected and page row ids, `setSelected()` ([#22](https://github.com/Javaabu/react-forms/issues/22)). Blade's bulk actions read the checkboxes with js-utilities. |
| `splitFieldProps`, `useField`, `useFieldValue`, `useFieldState`, `usePublishField` | — | ⚛️ | Hooks for [custom fields](./advanced-usage/custom-fields) that behave like the built-in ones: `useForm()` data, reset, `ConditionalWrapper`, errors ([#23](https://github.com/Javaabu/react-forms/issues/23)). Blade has no counterpart: a Blade field is markup that submits natively. |
| `BulkActions`, `Filter`, `FilterSubmit`, `PerPage`, `SearchForm`, `NoItems` | `bulk-actions`, `filter`, `filter-submit`, `per-page`, `search-form`, `no-items` | ✅ | |
| `Pagination` | `pagination` | ✅ | New in v2. Takes a paginator's JSON in React. |
| `Icon` | `icon` | ✅ | `name`, `className`. The same 30 bundled Lucide names; any other name is icon font classes (`<i class>`) in both. React also has `chevrons-up-down` and the aliases `close` (`x`) and `error` (`circle-alert`). The Onu adapter draws them with Onu's `Icon`. See [Icons](./basic-usage/icons). |
| — | `js-errors` | 🅱️ | A placeholder for js-utilities' AJAX errors. React shows those errors itself. |

# Attributes every field shares

| React | Blade | Notes |
| --- | --- | --- |
| `name`, `label`, `id`, `model`, `default`, `required`, `disabled` | same | `model={false}` ignores the bound model in both. |
| `showLabel`, `showErrors`, `inline`, `inlineLabelClass`, `inlineInputClass`, `formGroupClass` | `show-label`, `show-errors`, `inline`, `inline-label-class`, `inline-input-class`, `form-group-class` | |
| `placeholder`, `showPlaceholder` | `placeholder`, `show-placeholder` | Text-like fields and selects. |
| `help` | slot `help` | |
| `prepend`, `append` | slots `prepend`, `append` | Text-like and number fields. |
| `thaana` | `thaana` | Free-text fields: type Thaana from a Latin keyboard. Thaana fields are `dir="rtl" lang="dv"`. |
| — | `floating`, `show-js-errors`, `framework` | 🅱️ Floating labels fail WCAG 2.2 as a label stand-in and Onu has none. `framework` is React's adapter (`FormsProvider ui`). |

# Per-component differences

Only what differs; everything else in a component's props is in both.

| Component | React only ⚛️ | Blade only 🅱️ | Why |
| --- | --- | --- | --- |
| `Form` | `form` (Inertia `useForm`), `onSubmit`, `onSuccess`, `onError`, `onProgress`, `visitOptions`, `preserveScroll`, `preserveState`, `resetOnSuccess`, `processing`, `disableWhileProcessing`, `errors`, `old`, `csrf`, `components` | — | Client-side submission. Blade forms submit natively; `@csrf` is automatic in both. |
| Value fields | `value` + `onChange` / `onValueChange` / `onCheckedChange`, `checked` | — | Controlled React props. |
| `Text` etc. | `thaanaToggle` | — | A Thaana / Latin switch on the input. |
| `Number`, `Latitude`, `Longitude` | `decimals`, `min`, `max`, `step` as props | (attribute bag) | Same names in both. |
| `Password` | — | `default` | React never pre-fills passwords, so there's nothing to default. |
| `Date`, `Datetime`, `Time` | `min`, `max` take dates | `date-format`, `icon`, `clear-icon`, `clear-btn-class`, `icon-wrapper-class` | React's pickers come from the adapter; values are submitted as `yyyy-MM-dd`, `yyyy-MM-dd HH:mm:ss`, `HH:mm` in both. |
| `Select2` | — | `is-first`, `is-icon-select`, `icon-prefix`, `parent-modal` | js-utilities / select2 options. React's dropdowns portal, so `parent-modal` isn't needed; the icon picker stays Blade-only. |
| `File`, `Image` | `onUploaded` | `upload-icon`, `clear-icon`, `download-icon`; `Image` `file-input-class` | Icons come from the adapter in React. |
| `Wysiwyg` | — | `rows` | The React editor sizes itself. |
| `ConditionalWrapper` | — | `json-encode` | How Blade writes the value into a `data-` attribute. |
| `Label` | `children` for content | `blank-label`, `inline`, `inline-label-class` | React's `FormGroup blankLabel` covers the blank label. |
| `TableHeading` | — | `colspan` | Plain `colSpan` in React. |
| `TabsPane` | — | `active`, `labelled-by` | React sets the active tab on `Tabs`, and generates the ids. |
| `AccordionItem` | `header` | `parent` | React items know their accordion. |
| `Modal` | `open`, `defaultOpen`, `onOpenChange`, `trigger` | — | React state. Blade opens a modal by its `id`. |
| `SearchForm` | `action` and every `Form` prop | `route`, `params`, `icon` | React passes the URL (or a Wayfinder route) as `action`. |
| `FormattedValue` | `arrays`, `wysiwyg` | `name`, `model` | React takes the value itself. |
| `Pagination` | `getPageHref`, `onPageChange` | — | Client-side page links. |
| Icons | `Icon` `size` | the `icons` config (which icon the date picker, clear, upload, … buttons use) | React's pickers and file inputs draw the adapter's icons. Replace the `Icon` slot to change every icon. |
| `Infolist` | `layout` | — | Sets every entry's layout; in Blade set `inline` on each entry. |
| `Accordion`, `Tabs` | `slots` | (named slots) | A record of named slots. |

# Behaviour

| Behaviour | Both |
| --- | --- |
| Value precedence | Old input, then the bound value (`data_get`), then `default`. `Select`/`Select2`: old input, then `default`, then the bound value. Old input wins even when `null` (the key was submitted). |
| Checkboxes | Once there is any old input, checked only when it contains the value. Otherwise an array binding contains the value, a scalar is truthy, or `default` when `null`. |
| Radios | ≠ Selected when the bound value equals their `value` (Blade v1 checked every radio of a group on a truthy value; React and v2 compare values). |
| Ids | From names: `address[city]` → `address-city`, `tags[]` → `tags`. Grouped checkboxes (`channels[]`) get the value appended: `channels-email`. |
| Labels | From names: `first_name` → `First Name`, translated (`__()` / `trans()`). |
| Multiple selects | Submit `name[]` and a `sync_<name>` hidden field (unless `excludeSyncField` or disabled). |
| Relations | `relation`: a bound model becomes its key, a collection its keys. |
| Errors | Bracket names map to dot keys (`items[0][name]` → `items.0.name`); array fields (`tags[]`) also show `tags.N` errors; the `default` bag unless `errorBag` / `bag`. |
| Accessibility | Invalid controls get `aria-invalid="true"` and `aria-describedby` pointing at the help text and errors; the first invalid field is focused when errors arrive (`focusOnError`). |
| Error summary | `Form summary` (default `false` in both, agreed in #18) lists every error at the top. React always shows a general message (a failed client-side submit) at the top. |
| Method spoofing and CSRF | `PUT`/`PATCH`/`DELETE` are sent as `POST` with `_method`; non-GET forms get `_token`. |
| Dates | Accept Laravel's formats; submit `yyyy-MM-dd`, `yyyy-MM-dd HH:mm:ss`, `HH:mm`. |
| Formatted values | Enums (`{ value, label }`) show their label (a status badge with `color`), booleans Yes / No, empty values `-`, arrays a list (text entries) or joined with `table_array_separator` (table cells). |
| Button colours | Bootstrap names (`primary`, `danger`, `outline-secondary`, …) in both; each React adapter maps them to its variants. |

# Strings

Both packages read the same keys, `forms::strings.<key>`, so an app's `lang/vendor/forms/{locale}/strings.php` changes Blade and React alike. See [Translations](./basic-usage/translations) for every key with its English and Dhivehi line.

| Key | Status |
| --- | --- |
| Every key of Blade v1's `strings.php` | ✅ |
| `clear`, `close`, `create_new`, `select_all`, `select_row` (with `:name`), `bulk_action`, `apply`, `filter`, `export`, `export_title`, `export_options`, `pagination`, `per_page`, `previous`, `next`, `error_summary_title`, `no_items_title`, `no_items_message`, `items` | ✅ (added in v2) |
| `table_array_separator` | ✅ `", "` (en) / `"، "` (dv) in both, agreed in #18 (Blade v1 was `","`) |
| `pagination_showing`, `sections` | 🅱️ Blade's paginator and tabs views |
| `sort_by`, `page`, `search`, `add_option`, `loading`, `error_loading_options`, `uploading`, `removing`, `are_you_sure`, `remove_file_confirm`, `remove_file_confirm_button`, `cancel`, `upload_error`, `remove_error`, `file_too_large`, `file_type_not_allowed`, `confirm_text`, `confirm_button`, `delete_confirm_text`, `delete_confirm_button`, `submit_failed`, `thaana_toggle`, `kb`, `mb`, `gb` | ⚛️ Client-side behaviour (js-utilities' messages and the React components' own text) |
