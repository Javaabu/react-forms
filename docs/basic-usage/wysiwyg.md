---
title: WYSIWYG
sidebar_position: 8
---

`Wysiwyg` is a rich text editor that submits HTML under its `name`. It replaces Blade's `wysiwyg` component and the `textarea wysiwyg` attribute (`<Textarea wysiwyg>` works too).

```blade
<x-forms::wysiwyg name="body" />
<x-forms::textarea name="body" wysiwyg />
```

```tsx
import { Form, Submit, Wysiwyg } from "@javaabu/forms"

export function ArticleBody({ article }) {
  return (
    <Form model={article} action={`/articles/${article.id}`} method="PATCH">
      <Wysiwyg name="body" label="ލިޔުން" />
      <Submit />
    </Form>
  )
}
```

# The editor

The editor comes from the adapter's `Wysiwyg` slot. For Onu's Tiptap editor, add `onuEditor` and install the Tiptap packages listed in Onu's editor docs:

```tsx
import { FormsProvider, mergeAdapters } from "@javaabu/forms"
import { onu } from "@javaabu/forms/onu"
import { onuEditor } from "@javaabu/forms/onu/editor"

const ui = mergeAdapters(onu, onuEditor)

<FormsProvider ui={ui}>…</FormsProvider>
```

Without an editor (the HTML and shadcn adapters, or Onu without `onuEditor`), `Wysiwyg` is a plain textarea that submits what you type. To use another editor, put it in the `Wysiwyg` slot: `components={{ Wysiwyg: MyEditor }}`, where `MyEditor` takes `WysiwygSlotProps` (`value`, `onValueChange(html)`, `name`, `id`, …) and submits the HTML under `name`. See [UI adapters](../advanced-usage/adapters).

# Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string \| null` | Controlled HTML. |
| `onChange` | `(html: string) => void` | |
| `placeholder`, `showPlaceholder` | `string`, `boolean` | |
| `className` | `string` | |

Plus the common field props ([Inputs](./inputs-and-textarea#props)).

# Accessibility

The editing area is labelled by the field's label. Onu's editor has a keyboard-accessible toolbar.
