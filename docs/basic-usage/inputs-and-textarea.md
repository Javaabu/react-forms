---
title: Input and textarea elements
sidebar_position: 1
---

Text fields render a label, the control, help text and errors. The id and label come from `name`, and the value comes from old input, the bound model or `default` (see [Model binding](./model-binding)).

```blade
<x-forms::text name="company_name" required />
<x-forms::email name="email" />
<x-forms::textarea name="address" rows="4" />
```

```tsx
import { Email, Form, Submit, Text, Textarea } from "@javaabu/forms"

export function CompanyForm({ company }) {
  return (
    <Form model={company} action="/companies" method="PATCH">
      <Text name="company_name" required />
      <Text name="name_dv" label="ނަން" thaana />
      <Email name="email" />
      <Textarea name="address" rows={4} />
      <Submit>ސޭވްކުރޭ</Submit>
    </Form>
  )
}
```

# Common patterns

```tsx
<Text name="company_name" />                         {/* label "Company Name", id "company_name" */}
<Text name="company_name" label="ކުންފުނީގެ ނަން" />
<Text name="address[city]" />                        {/* id "address-city", reads address.city */}
<Text name="company_name" inline />                  {/* label beside the input */}
<Text name="search" placeholder="ހޯދާ..." showLabel={false} />
<Text name="username" showErrors={false} />
<Text name="price" prepend="MVR" append=".00" />
<Text name="name_dv" thaana thaanaToggle />          {/* type Thaana from a Latin keyboard */}
<Text name="title" help="Shown on the listing page." />
```

# Components

| Component | Blade | Notes |
| --- | --- | --- |
| `Input` | `input` | `type` picks the control: `number` renders `Number`, `hidden` renders `Hidden`, anything else a text-like input. Prefer the typed components. |
| `Text` | `text` | |
| `Email` | `email` | Always left-to-right, no Thaana. |
| `Password` | `password` | Never pre-filled, and takes no `default`. |
| `Tel` | `tel` | Left-to-right, `inputMode="tel"`. Submitted as typed. |
| `Url` | `url` | Adds `https://` on blur when the scheme is missing, like js-utilities' `urlInput`. |
| `Number` | `number` | Submits the raw number. Takes `min`, `max`, `step`, `decimals`, `prepend`, `append`, `value` / `onValueChange`. |
| `Latitude`, `Longitude` | `latitude`, `longitude` | `Number` from -90 to 90 (or -180 to 180) with 6 decimals. |
| `Hidden` | `hidden` | A hidden input with the same value precedence. An array value submits one `name[]` input per item. |
| `Textarea` | `textarea` | `rows` (default `3`), `autoResize` (default `false`), `thaana`, `wysiwyg`. |

`<Textarea wysiwyg>` renders the rich text editor, like Blade's `<x-forms::textarea wysiwyg>`. See [WYSIWYG](./wysiwyg).

# Props

Every field takes these:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | **Required** | Name, id, bound value, old input and error lookup. |
| `label` | `ReactNode` | generated | A title-cased label from `name`, translated with `__()`. |
| `id` | `string` | generated | `address[city]` becomes `address-city`. |
| `model` | `object \| false` | bound model | Where the value comes from. `false` ignores the bound model. |
| `default` | `unknown` | | Value when there is no old input and the bound value is `null`. |
| `required` | `boolean` | `false` | The `required` attribute and the required marker. |
| `disabled` | `boolean` | | Also disabled while the form submits. |
| `showLabel` | `boolean` | `true` | `false` hides the label visually. Screen readers still read it. |
| `showErrors` | `boolean` | `true` | `false` hides this field's errors and invalid state. |
| `inline` | `boolean` | `false` | Label beside the control. |
| `inlineLabelClass`, `inlineInputClass` | `string` | | Classes for the label and control columns. |
| `formGroupClass` | `string` | | Classes for the field wrapper. |
| `help` | `ReactNode` | | Help text under the control (Blade's `help` slot). |

Text-like fields (`Text`, `Email`, `Password`, `Tel`, `Url`, `Input`) also take:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| number \| null` | | Controlled value. Pair it with `onChange`. |
| `placeholder` | `string` | | |
| `showPlaceholder` | `boolean` | `false` | Use the label as the placeholder. |
| `prepend`, `append` | `ReactNode` | | Content before and after the input (Blade's slots). |
| `thaana` | `boolean` | `false` | Type Thaana from a Latin keyboard. The input gets `dir="rtl" lang="dv"`. `Text` and `Input` only. |
| `thaanaToggle` | `boolean` | `false` | A button that switches between Thaana and Latin. |

Other `<input>` attributes (`autoComplete`, `maxLength`, `onBlur`, …) are passed to the input.

# How it renders

The adapter draws the control. The HTML adapter renders a native `<input>` or `<textarea>`. The Onu adapter uses Onu's `TextInput`, `PasswordInput` (with a show / hide button), `NumberInput` (locale-aware) and `Textarea`. The shadcn adapter uses your `Input` and `Textarea`. See [UI adapters](../advanced-usage/adapters).

# Accessibility

The label is tied to the control. Help text and errors are linked with `aria-describedby`, and an invalid field gets `aria-invalid="true"`. `showLabel={false}` keeps the label for screen readers.
