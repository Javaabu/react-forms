---
title: Input and textarea elements
sidebar_position: 1
---

```tsx
<Forms.Input name="company_name" />
<Forms.Input name="company_name" label="Company Name" />
<Forms.Input name="company_name" label={t("Company Name")} />
<Forms.Input name="company_name" inline />
<Forms.Input name="search" placeholder="Search..." showLabel={false} />
<Forms.Input name="email" required />
<Forms.Input name="username" showErrors={false} />
<Forms.Input name="price" prepend="MVR" append=".00" />
<Forms.Text name="name" thaana />  {/* Thaana keyboard for Dhivehi */}
```

## Available options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | **Required** | Name, id, bound value, old input and error lookup. |
| `label` | `ReactNode` | generated | A title-cased label from `name`, passed through `FormsProvider translate`. |
| `id` | `string` | generated | `address[city]` → `address-city`. |
| `model` | `object \| false` | bound model | Binding target; `false` ignores the bound model. |
| `default` | `unknown` | | Value when there is no old input and no bound value. |
| `value` | `string \| number` | | Controlled value. |
| `type` | `string` | `"text"` | `email`, `password`, `number`, `url`, `hidden` and `tel` use the matching component. |
| `placeholder` | `string` | | |
| `showPlaceholder` | `boolean` | `false` | Use the label as the placeholder. |
| `required` | `boolean` | `false` | `required` attribute and the `*` marker. |
| `disabled` | `boolean` | from `Form` | |
| `inline` | `boolean` | `false` | Label beside the input. |
| `inlineLabelClass` / `inlineInputClass` | `string` | | Classes for the label and control columns. |
| `formGroupClass` | `string` | | Classes for the field wrapper. |
| `showLabel` | `boolean` | `true` | `false` hides the label visually (kept for screen readers). |
| `showErrors` | `boolean` | `true` | `false` hides this field's errors. |
| `help` | `ReactNode` | | Help text (Blade's `help` slot). |
| `prepend` / `append` | `ReactNode` | | Addons (Blade's slots). |
| `thaana`, `thaanaToggle` | | | Onu's Thaana keyboard, for free-text fields. |

Other `<input>` props are passed through.

## Components

`Text`, `Email`, `Password` (never pre-filled), `Number` (submits the raw number), `Tel`, `Url` (adds `https://` when it is missing), `Hidden`, `Latitude` (-90 to 90) and `Longitude` (-180 to 180), each with the props above.

`Textarea` adds `rows` (default `3`) and `autoResize` (default `false`).

## Accessibility

Every field uses Onu's `FormField`: the label is tied to the control, and the help text and errors are wired with `aria-describedby` and `aria-invalid`. `showLabel={false}` keeps the label for screen readers.
