---
title: Installation & Setup
sidebar_position: 1.2
---

```bash
npm install @javaabu/react-forms @javaabu/onu
```

`@javaabu/onu` is a peer dependency. Set Onu up first (see its installation guide), then let Tailwind CSS v4 see this package's classes too:

```css
@import "tailwindcss";
@import "@javaabu/onu/tailwind.css";
@import "@javaabu/react-forms/tailwind.css";
```

Wrap the app once:

```tsx
import { OnuProvider, ThemeProvider } from "@javaabu/onu"
import { FormsProvider } from "@javaabu/react-forms"

<ThemeProvider>
  <OnuProvider locale={dv}>
    <FormsProvider translate={t} settings={{ per_page: 20, max_upload_file_size: 10240, max_image_file_size: 2048 }}>
      <App />
    </FormsProvider>
  </OnuProvider>
</ThemeProvider>
```

`FormsProvider` is optional. It plays the part of `config/forms.php`, the package translations and `get_setting()`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `translate` | `(text) => string` | unchanged | Translates labels and titles generated from names, like Blade's `trans()`. |
| `messages` | `Partial<FormsMessages>` | | Overrides package strings (e.g. `requiredText`, `nothingSelected`). |
| `settings` | `Record<string, unknown>` | `per_page: 20`, `max_upload_file_size: 10240`, `max_image_file_size: 2048` | `get_setting()` values: page size, max file sizes in KB, `default_lat` / `default_lng`. |
| `csrfToken` | `string \| null` | `<meta name="csrf-token">` | Token for `_token` fields and uploads. |
| `old` | `object` | | Old input for every form, e.g. an Inertia shared prop. A form's `old` prop wins. |
| `authorize` | `(ability, arg, guard) => boolean` | | Resolves `can` props (`ConditionalLink`, `NoItems`). Without it, `can` checks fail. |

The package strings follow Onu's locale. English and Dhivehi are built in.

## Importing

A namespace import reads like Blade's `x-forms::` prefix and avoids clashes with the globals `Date`, `Number`, `File` and `Image`:

```tsx
import * as Forms from "@javaabu/react-forms"

<Forms.Date name="published_at" />
```

The rich text editor and the map input have their own entries, so their heavy dependencies only load when you use them:

```tsx
import { Wysiwyg } from "@javaabu/react-forms/editor"
import { MapInput } from "@javaabu/react-forms/maps"
```
