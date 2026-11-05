---
title: API reference
sidebar_position: 1.45
---

# Entry points

| Import | Exports | Needs |
| --- | --- | --- |
| `@javaabu/forms` | Every component, `FormsProvider`, hooks, helpers, the adapter types, `fetchRouter` | React, `@javaabu/i18n` |
| `@javaabu/forms/html` | `html` (the default adapter), `pageWindow` | |
| `@javaabu/forms/onu` | `onu`, `colorToVariant` | `@javaabu/onu` |
| `@javaabu/forms/onu/editor` | `onuEditor` (`Wysiwyg` slot) | Onu's Tiptap peers |
| `@javaabu/forms/onu/maps` | `onuMaps` (`Map` slot) | Onu's map peers |
| `@javaabu/forms/shadcn` | `createShadcnAdapter`, `colorToShadcnVariant`, `ShadcnComponents` | Your shadcn components |
| `@javaabu/forms/inertia` | `inertia` (router), `inertiaLinks` (`Link` slot) | `@inertiajs/react` |
| `@javaabu/forms/testing` | `testAdapter`, `adapterConformance` | `@testing-library/react`, a DOM |
| `@javaabu/forms/tailwind.css` | `@source` for the package's classes | Tailwind CSS v4 |

Every module is marked `"use client"`. Builds: ESM (`.js`), CommonJS (`.cjs`) and types (`.d.ts`).

# Components

| Group | Components | Page |
| --- | --- | --- |
| Forms | `Form`, `FormGroup`, `Label`, `LabelRequired`, `InputHelp`, `Errors`, `ErrorSummary`, `Model`, `OldInput` | [Forms and buttons](./basic-usage/forms-and-buttons), [Errors](./basic-usage/errors), [Model binding](./basic-usage/model-binding) |
| Inputs | `Input`, `Text`, `Email`, `Password`, `Number`, `Tel`, `Url`, `Hidden`, `Latitude`, `Longitude`, `Textarea` | [Inputs and textarea](./basic-usage/inputs-and-textarea) |
| Choices | `Checkbox`, `Radio`, `Select`, `Select2` | [Checkboxes and radios](./basic-usage/checkbox-and-radio), [Selects](./basic-usage/select-elements), [Select2](./basic-usage/select2) |
| Dates, files, rich text, maps | `Date`, `Datetime`, `Time`, `File`, `FileUpload`, `Image`, `ImageUpload`, `Wysiwyg`, `MapInput` | [Dates](./basic-usage/dates), [Files](./basic-usage/file-inputs), [WYSIWYG](./basic-usage/wysiwyg), [Map input](./basic-usage/map-input) |
| Buttons and icons | `Button`, `Submit`, `LinkButton`, `ButtonGroup`, `Icon` | [Forms and buttons](./basic-usage/forms-and-buttons), [Icons](./basic-usage/icons) |
| Display | `Alert`, `Card`, `CardHeader`, `CardTitle`, `CardSubtitle`, `CardFooter`, `Accordion`, `AccordionItem`, `Tabs`, `TabsPane`, `NavTabs`, `Modal`, `Status`, `ConditionalLink`, `ConditionalWrapper`, `TextEntry`, `BooleanEntry`, `Infolist`, `FormattedValue` | [Display](./basic-usage/display), [Conditional wrapper](./basic-usage/conditional-wrapper) |
| Listing | `Table`, `TableRow`, `TableCell`, `TableHeading`, `TableEmptyRow`, `BulkActions`, `Filter`, `FilterSubmit`, `PerPage`, `SearchForm`, `NoItems`, `Pagination` | [Listing pages](./basic-usage/listing) |

# Hooks

| Hook | Returns |
| --- | --- |
| `useFormsConfig()` | The resolved `FormsProvider` configuration |
| `useUi()` | The resolved adapter components (overrides → adapter → HTML) |
| `useFormsServices()` | `confirm()` and `notify()` of the adapter |
| `useFormsTranslation()` | `t(key, replace)`, `translate(text)`, `locale`, `direction` |
| `useFormState()` | The surrounding form's `processing`, `status`, `progress`, `errors`, `message`, `setErrors()`, `clearErrors()`, or `null` |
| `useFormStatus()` | `processing`, `status`, `progress`, `errors` (safe outside a form) |
| `useFieldErrors(name, bag?)` | A field's error messages |
| `useField(options)` | Ids, label, errors, ARIA props and `wrap()`: build your own field component |
| `useFieldNames(props)` | The id, label and placeholder generated from a name |
| `useBoundModel()`, `useOldInput()`, `useFieldValue(name, model, default)` | Binding |
| `useWatchField(selector)` | Another field's value and checked state, by `#id` or name |
| `splitFieldProps(props)` | `{ field, rest }`: the shared `FieldProps` apart from your control's props. For [custom fields](./advanced-usage/custom-fields) |
| `useFieldState(name, initial, options?)` | `[value, setValue]`: reads and writes Inertia `useForm()` data, resets with the form, clears the field's errors on change. For custom fields |
| `usePublishField(entry)` | Publishes a field's value so `ConditionalWrapper` and `useWatchField` see it. For custom fields |
| `useTableSelection()` | The surrounding `Table`'s `model`, `selected` and `rows` ids and `setSelected()`, or `null`. For content in `bulkForm` |
| `useSetting(key)`, `useCsrfToken()` | `get_setting()`, the CSRF token |
| `useRemoteOptions(remote, query)` | Server-searched select options, for adapters |
| `useReveal(ref, onReveal)` | Calls `onReveal` when an invalid field inside `ref` needs to be shown, for adapters' tabs and accordions |

# Helpers

| Function | What it does |
| --- | --- |
| `defineAdapter(adapter)`, `mergeAdapters(...adapters)` | Type and combine adapters |
| `resolveAction(action, model?)` | A URL, Wayfinder route or route function → `{ url, method }` |
| `fetchRouter` | A router that submits with XHR and reads JSON 422s |
| `formDataToObject(data)` | `FormData` → object (repeated names become arrays) |
| `ValidationError`, `getValidationErrors(value)`, `readValidationErrors(value)` | Laravel 422 payloads |
| `errorsFor(errors, name)`, `selectErrorBag(errors, bag?)`, `toDotNotation(name)`, `focusFirstInvalid(root, errors)` | Error lookup and focus |
| `thaanaKeyDown(event)`, `toThaana(text)`, `THAANA_KEYMAP` | Thaana typing |
| `nameToId`, `nameToLabel`, `bracketsToDots`, `dataGet` | Laravel `Str` / `data_get` ports |
| `normalizeOptions(options, fields?)` | Any option shape → `SelectOption[]` |
| `parseDateValue(value)` | What Laravel sends for dates → `Date` |
| `ALLOWED_MIME_TYPES`, `registerMimeTypes`, `registerMimeTypeExtensions`, `getAllowedMimeTypes`, `getExtensions`, `getMaxFileSize`, `formatFileSize` | javaabu/helpers' `AllowedMimeTypes` |
| `TabPanel` | A tab panel for adapters: always mounted, hidden while inactive, opened for invalid fields |
| `colorToTone(color)` | A Bootstrap colour → a status tone |
| `getBoundValue(target, name)` | The value at a field name (bracket or dot notation) on a model |
| `DEFAULT_SETTINGS` | The `get_setting()` defaults: `per_page`, `max_upload_file_size`, `max_image_file_size` |
| `en`, `dv`, `STRINGS_PREFIX` | The bundled lines and their key prefix (`forms::strings.`) |
| `BUNDLED_ICONS`, `ICON_ALIASES`, `resolveIconName(name)` | Blade's bundled Lucide icon names, the older aliases (`close`, `error`), and the bundled icon a name draws (`null` for icon font classes). For adapters |

# Types

The adapter contract (`FormsAdapter`, `FormsComponents` and one `…SlotProps` per slot), the router contract (`FormsRouter`, `SubmitRequest`, `SubmitCallbacks`, `VisitOptions`, `FormAction`, `RouteDefinition`, `RouteFormDefinition`), errors (`FormErrors`, `PageErrors`, `ValidationPayload`), icons (`IconName`, `BundledIconName`), custom fields (`FieldProps`, `UseFieldOptions`, `FieldStateOptions`, `FieldEntry`, `FieldKind`), `TableSelection`, and every component's `…Props` are exported from `@javaabu/forms`.
