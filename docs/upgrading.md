---
title: Upgrading from @javaabu/react-forms
sidebar_position: 1.55
---

`@javaabu/forms` 1.0 replaces `@javaabu/react-forms` 0.x. The components and their props are the same; what changed is the package name, how the UI is chosen, strings, and a few defaults.

# 1. Change the package

```bash
npm uninstall @javaabu/react-forms
npm install @javaabu/forms
```

Replace the imports: `@javaabu/react-forms` → `@javaabu/forms`, and update the Tailwind source line in your CSS to `@import "@javaabu/forms/tailwind.css";`.

# 2. Choose the Onu adapter

0.x always rendered with Onu. 1.0 renders plain HTML unless you pass an adapter, so add it to your `FormsProvider` (or add a provider, which 0.x didn't require):

```tsx
import { FormsProvider, mergeAdapters } from "@javaabu/forms"
import { onu } from "@javaabu/forms/onu"
import { onuEditor } from "@javaabu/forms/onu/editor"
import { onuMaps } from "@javaabu/forms/onu/maps"

const ui = mergeAdapters(onu, onuEditor, onuMaps) // editor and maps only if you use them

<FormsProvider ui={ui}>…</FormsProvider>
```

Onu 0.2.1 or later is needed.

# 3. Wysiwyg and MapInput imports

```diff
- import { Wysiwyg } from "@javaabu/react-forms/editor"
- import { MapInput } from "@javaabu/react-forms/maps"
+ import { Wysiwyg, MapInput } from "@javaabu/forms"
```

The editor and maps themselves come from `onuEditor` and `onuMaps` (step 2).

# 4. Strings

- Strings come from `@javaabu/i18n` and follow `<html lang>` and `setLocale()`, not `OnuProvider locale`. Keep both in step if you switch languages at runtime (see [Translations](./basic-usage/translations)).
- `FormsProvider messages` is gone. Change lines in `lang/vendor/forms/{locale}/strings.php`, or with `addLines({ "strings.nothing_selected": "…" }, "dv", "forms")`.
- `useFormsTranslation().t()` keys are snake_case, as in Blade: `t("nothingSelected")` → `t("nothing_selected")`.
- Generated labels go through `__()`, so JSON lines (`lang/dv.json`) translate them. `FormsProvider translate` still overrides that.

# 5. Forms

- **`summary` defaults to `false`**, as in Blade. Add `summary` to forms that should list every error at the top.
- **`form` is Inertia's `useForm()`.** 0.x passed `form` (react-hook-form) through to Onu's form. With react-hook-form, submit with `onSubmit` instead.
- `useOnuForm()` → `useFormStatus()` (processing, status, progress, errors) or `useFormState()` (also `setErrors`).
- Errors from Inertia page props are automatic with `router={inertia}` (see [Inertia](./advanced-usage/inertia)).
- `action` also takes Wayfinder routes.

# 6. Props that changed

| Component | 0.x | 1.0 |
| --- | --- | --- |
| `Date`, `Datetime`, `Time` | Onu picker props, `onChange(date)` | `value`, `onChange(value, date)`, `min`, `max`, `placeholder`, `className` |
| `File` | Onu `FileInput` props | `multiple`, `onChange(files)`, `className`, `fileInputClass` |
| `Image` | Onu `ImageInput` props | the documented props, `onChange(file)` |
| `Number` | Onu `NumberInput` props (`formatOptions`) | `min`, `max`, `step`, `decimals`, `onValueChange` |
| `Button`, `LinkButton` | `variant` (Onu) | `color` (Blade colours) and `size`, `startIcon`, `endIcon`, `loading` |
| `Alert`, `Card`, `Modal`, `Tabs`, `NavTabs`, `Status`, `NoItems`, `Pagination` | Onu props passed through | the documented props only |
| `colorToVariant` | from the main entry | from `@javaabu/forms/onu` |

If you need an Onu prop the components don't pass, replace that slot with your own component: `<FormsProvider components={{ Date: MyDatePicker }}>`. See [UI adapters](./advanced-usage/adapters).
