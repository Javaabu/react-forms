---
title: Migrating from Blade
sidebar_position: 1.5
---

Attributes become camelCase props (`show-label` → `showLabel`, `:options="$x"` → `options={x}`). Boolean attributes stay boolean (`required` → `required`). Named slots become props of the same name in camelCase (`<x-slot:help>` → `help={…}`). The default slot becomes `children`.

## Components

| Blade | React |
| --- | --- |
| `x-forms::form` | `Form` |
| `@model … @endmodel` | `Model` |
| `x-forms::form-group`, `label`, `label-required`, `input-help`, `errors` | `FormGroup`, `Label`, `LabelRequired`, `InputHelp`, `Errors` |
| `x-forms::error-summary` | `ErrorSummary` |
| `x-forms::formatted-value` | `FormattedValue` |
| `x-forms::input`, `text`, `email`, `password`, `number`, `tel`, `url`, `hidden`, `latitude`, `longitude` | `Input`, `Text`, `Email`, `Password`, `Number`, `Tel`, `Url`, `Hidden`, `Latitude`, `Longitude` |
| `x-forms::textarea` | `Textarea` |
| `x-forms::wysiwyg`, `textarea wysiwyg` | `Wysiwyg`, `Textarea wysiwyg` |
| `x-forms::checkbox`, `radio` | `Checkbox`, `Radio` |
| `x-forms::date`, `datetime`, `time` | `Date`, `Datetime`, `Time` |
| `x-forms::select`, `select2` | `Select`, `Select2` |
| `x-forms::file`, `file-upload`, `image`, `image-upload` | `File`, `FileUpload`, `Image`, `ImageUpload` |
| `x-forms::map-input` | `MapInput` |
| `x-forms::conditional-wrapper` | `ConditionalWrapper` |
| `x-forms::button`, `submit`, `link-button`, `button-group` | `Button`, `Submit`, `LinkButton`, `ButtonGroup` |
| `x-forms::alert` | `Alert` |
| `x-forms::card` (+ `.header`, `.title`, `.subtitle`, `.footer`) | `Card`, `CardHeader`, `CardTitle`, `CardSubtitle`, `CardFooter` |
| `x-forms::accordion`, `accordion.item` | `Accordion`, `AccordionItem` |
| `x-forms::tabs`, `tabs.pane`, `nav-tabs` | `Tabs`, `TabsPane`, `NavTabs` |
| `x-forms::modal` | `Modal` |
| `x-forms::status` | `Status` |
| `x-forms::conditional-link` | `ConditionalLink` |
| `x-forms::text-entry`, `boolean-entry`, `infolist` | `TextEntry`, `BooleanEntry`, `Infolist` |
| `x-forms::table` (+ `.row`, `.cell`, `.heading`, `.empty-row`) | `Table`, `TableRow`, `TableCell`, `TableHeading`, `TableEmptyRow` |
| `x-forms::bulk-actions`, `filter`, `filter-submit`, `per-page`, `search-form`, `no-items` | `BulkActions`, `Filter`, `FilterSubmit`, `PerPage`, `SearchForm`, `NoItems` |
| pagination partials | `Pagination` |

## Laravel-side values in React

| Blade | React |
| --- | --- |
| `old()` | `Form old={…}` or `FormsProvider old={…}` (e.g. an Inertia shared prop of `session()->getOldInput()`) |
| `$errors` | Automatic with the Inertia router (page props, `errorBag`); otherwise `Form errors`, `FormsProvider errors`, or a 422 from `onSubmit` / `fetchRouter` |
| `@csrf` | added for you from `FormsProvider csrfToken` or the `csrf-token` meta tag |
| `get_setting()` | `FormsProvider settings` |
| `can` / `@can` | `FormsProvider authorize` |
| `trans()` on generated labels | `__()` from `@javaabu/i18n`, or `FormsProvider translate` |
| `route()` | Wayfinder routes as `Form action` (`store()`, `update.form(user)`, or `update` with the model), or any URL |
| Eloquent models | their JSON: plain objects. Relations: `country_id` or loaded `tags`; media: spatie `Media` JSON in `media` |

## Differences

- **`framework` is the adapter.** Blade's `framework` setting (Bootstrap, Material Admin, Onu) is React's `FormsProvider ui` (Onu, shadcn/ui, plain HTML, or your own). See [UI adapters](./advanced-usage/adapters).
- **No `floating` labels.** A label shown as a placeholder fails WCAG 2.2, and Onu has none. Use the default or `inline` layout.
- **`showLabel={false}` hides the label visually** but keeps it as the accessible name. The field still shows help and errors.
- **No `show-js-errors` / `JsErrors`.** Errors from a client-side submit appear under the fields themselves.
- **`Select2`**: `isFirst`, `isIconSelect`, `iconPrefix` and `parentModal` aren't supported or needed. A child can name its parent with `parent="country"` instead of the parent's `child="#state"`; both work.
- **Multiple selects always submit `name[]`**, even when the name has no `[]`, so Laravel gets an array.
- **List options** (`['a', 'b']`) keep PHP's meaning: the values are `0` and `1`, as when Laravel sends a PHP list as JSON. Use `{ a: "A" }`, pairs or `{ value, label }` objects for other values. JS objects sort integer keys, so pass ordered pairs (`[[10, "10"], [5, "5"]]`) when the order matters.
- **Radios** are selected when the bound value equals their `value`. Blade v1 checked every radio of a group for a truthy scalar, so the last one won.
- **Grouped checkboxes** (`name="channels[]"`) get unique ids (`channels-email`) without an explicit `id`.
- **Dates** are submitted as `yyyy-MM-dd`, `yyyy-MM-dd HH:mm:ss` and `HH:mm`. The picker comes from the adapter, so `dateFormat`, `icon`, `clearIcon` and `clearBtnClass` don't apply.
- **Passwords** never take a `default`: they are never pre-filled.
- **`Tabs` with `url`** navigate with `window.location`. For router links use `NavTabs` with the `inertiaLinks` adapter.
- **Text entries** render enums serialized as `{ value, label }` (with `color`, a status badge), booleans as Yes / No, arrays as lists. HTML in `admin_link` is not rendered; pass children instead.
- **`Wysiwyg`** uses the adapter's editor (Onu: Tiptap via `@javaabu/forms/onu/editor`), not TinyMCE. It still submits HTML.
- **`Form summary`** defaults to `false`, as in Blade. A failed client-side submit (not a validation error) always shows its message at the top.

Every component and attribute, with its Blade counterpart, is in [Parity with javaabu/forms](./parity).
