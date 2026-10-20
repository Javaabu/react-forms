---
title: Migrating from Blade
sidebar_position: 1.5
---

Attributes become camelCase props (`show-label` → `showLabel`, `:options="$x"` → `options={x}`). Boolean attributes stay boolean (`required` → `required`). Named slots become props of the same name in camelCase (`<x-slot:help>` → `help={…}`). The default slot becomes `children`.

## Components

| Blade | React | Built on (Onu) |
| --- | --- | --- |
| `x-forms::form` | `Form` | `Form` |
| `@model … @endmodel` | `Model` | |
| `x-forms::form-group`, `label`, `label-required`, `input-help`, `errors` | `FormGroup`, `Label`, `LabelRequired`, `InputHelp`, `Errors` | `FormField`, `Label`, `RequiredMarker`, `HelpText`, `FieldErrors` |
| `x-forms::input`, `text`, `email`, `password`, `number`, `tel`, `url`, `hidden`, `latitude`, `longitude` | `Input`, `Text`, `Email`, `Password`, `Number`, `Tel`, `Url`, `Hidden`, `Latitude`, `Longitude` | `TextInput`, `EmailInput`, `PasswordInput`, `NumberInput`, `UrlInput`, `HiddenInput` |
| `x-forms::textarea` | `Textarea` | `Textarea` |
| `x-forms::wysiwyg`, `textarea wysiwyg` | `Wysiwyg` (`@javaabu/react-forms/editor`) | `WysiwygEditor` |
| `x-forms::checkbox`, `radio` | `Checkbox`, `Radio` | `Checkbox`, native radio |
| `x-forms::date`, `datetime`, `time` | `Date`, `Datetime`, `Time` | `DatePicker`, `DateTimePicker`, `TimePicker` |
| `x-forms::select`, `select2` | `Select`, `Select2` | `Select`, `SearchableSelect`, `MultiSelect`, `ApiSelect`, `QuickCreateSelect` |
| `x-forms::file`, `file-upload`, `image`, `image-upload` | `File`, `FileUpload`, `Image`, `ImageUpload` | `FileInput`, `ImageInput` |
| `x-forms::map-input` | `MapInput` (`@javaabu/react-forms/maps`) | `MapPicker`, `MapRadius`, `MapPolygon` |
| `x-forms::conditional-wrapper` | `ConditionalWrapper` | `ConditionalDisplay` |
| `x-forms::button`, `submit`, `link-button`, `button-group` | `Button`, `Submit`, `LinkButton`, `ButtonGroup` | `Button`, `LinkButton`, `ButtonGroup` |
| `x-forms::alert` | `Alert` | `Callout` |
| `x-forms::card` (+ `.header`, `.title`, `.subtitle`, `.footer`) | `Card`, `CardHeader`, `CardTitle`, `CardSubtitle`, `CardFooter` | `Card` |
| `x-forms::accordion`, `accordion.item` | `Accordion`, `AccordionItem` | `Accordion` |
| `x-forms::tabs`, `tabs.pane`, `nav-tabs` | `Tabs`, `TabsPane`, `NavTabs` | `Tabs`, `NavTabs` |
| `x-forms::modal` | `Modal` | `Modal` |
| `x-forms::status` | `Status` | `StatusBadge` |
| `x-forms::conditional-link` | `ConditionalLink` | `ConditionalLink` |
| `x-forms::text-entry`, `boolean-entry`, `infolist` | `TextEntry`, `BooleanEntry`, `Infolist` | `DescriptionList` |
| `x-forms::table` (+ `.row`, `.cell`, `.heading`, `.empty-row`) | `Table`, `TableRow`, `TableCell`, `TableHeading`, `TableEmptyRow` | table primitives, `Checkbox` |
| `x-forms::bulk-actions`, `filter`, `filter-submit`, `per-page`, `search-form`, `no-items` | `BulkActions`, `Filter`, `FilterSubmit`, `PerPage`, `SearchForm`, `NoItems` | `Select`, `Button`, `ActionMenu`, `EmptyState` |
| pagination partials | `Pagination` | `Pagination` |

## Laravel-side values in React

| Blade | React |
| --- | --- |
| `old()` | `Form old={…}` or `FormsProvider old={…}` (e.g. an Inertia shared prop of `session()->getOldInput()`) |
| `$errors` | `Form errors={…}` (Inertia's `errors`), or a 422 thrown from `onSubmit` |
| `@csrf` | added for you from `FormsProvider csrfToken` or the `csrf-token` meta tag |
| `get_setting()` | `FormsProvider settings` |
| `can` / `@can` | `FormsProvider authorize` |
| `trans()` on generated labels | `FormsProvider translate` |
| `route()` | build URLs yourself (e.g. Ziggy's `route()`) and pass `action` / `url` |
| Eloquent models | their JSON: plain objects. Relations: `country_id` or loaded `tags`; media: spatie `Media` JSON in `media` |

## Differences

- **No `framework` prop.** Onu replaces the Bootstrap 5 and Material Admin 2.6 views, so the framework settings (`inline-label-class` defaults, icon classes) don't apply. `inlineLabelClass` / `inlineInputClass` still take classes.
- **No `floating` labels.** Onu has no floating-label layout, and a label shown as a placeholder fails WCAG 2.2. Use the default or `inline` layout.
- **`showLabel={false}` hides the label visually** but keeps it as the accessible name. The field still shows help and errors.
- **No `show-js-errors` / `JsErrors`.** Client-side errors from `Form`'s `onSubmit` (or `useOnuForm().setErrors`) appear under the fields themselves.
- **`Select2`**: `isFirst` and `parentModal` aren't needed. The cascade reacts to the parent, and Onu's popovers sit above modals. `isIconSelect` is not supported. A child can name its parent with `parent="country"` instead of the parent's `child="#state"`. Both work.
- **List options** (`['a', 'b']`) keep PHP's meaning: the values are `0` and `1`, as when Laravel sends a PHP list as JSON. Use `{ a: "A" }`, pairs or `{ value, label }` objects for other values. JS objects sort integer keys, so pass ordered pairs (`[[10, "10"], [5, "5"]]`) when the order matters.
- **Radios** are selected when the bound value equals their `value`. Blade checks every radio of a group for a truthy scalar, so the last one wins.
- **Grouped checkboxes** (`name="channels[]"`) get unique ids (`channels-email`) without an explicit `id`.
- **Dates** are submitted as `yyyy-MM-dd`, `yyyy-MM-ddTHH:mm:ss` and `HH:mm`; `dateFormat`, `icon`, `clearIcon` and `clearBtnClass` are replaced by Onu's picker (`format` is the date-fns display format).
- **`Tabs` with `url`** navigate with `window.location`. For router links use `NavTabs` with `OnuProvider linkComponent`.
- **Text entries** render enums serialized as `{ value, label }` (with `color`, a status badge), booleans as Yes / No, arrays as lists. HTML in `admin_link` is not rendered; pass children instead.
- **`Wysiwyg`** uses Onu's Tiptap editor, not TinyMCE. It still submits HTML.
