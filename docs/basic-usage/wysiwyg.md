---
title: WYSIWYG
sidebar_position: 8
---

```tsx
import { Wysiwyg } from "@javaabu/react-forms/editor"

<Wysiwyg name="message" />
<Wysiwyg name="body" model={article} thaana />
```

This replaces Blade's `wysiwyg` component and the `textarea wysiwyg` attribute. It uses Onu's Tiptap editor (`@javaabu/onu/editor`); install the Tiptap packages listed in Onu's editor docs. The HTML is submitted under `name`.

## Accessibility

The editor's toolbar is keyboard accessible, and the editing area is labelled by the field's label.
