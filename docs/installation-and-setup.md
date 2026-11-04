---
title: Installation and setup
sidebar_position: 1.2
---

# Install

```bash
npm install @javaabu/forms
```

Until it is on npm, install it from GitHub. It builds itself when installed:

```bash
pnpm add "@javaabu/forms@github:Javaabu/react-forms#next-gen"
```

With pnpm 10, allow the build scripts of the package and of `@javaabu/i18n` in your `package.json`:

```json
{
  "pnpm": { "onlyBuiltDependencies": ["@javaabu/forms", "@javaabu/i18n"] }
}
```

# Choose a UI adapter

Without an adapter, the components render plain HTML. Pick the adapter for your UI kit once, at the root of your app.

## Onu

```bash
npm install @javaabu/onu
```

```css
/* resources/css/app.css */
@import "tailwindcss";
@import "@javaabu/onu/tailwind.css";
@import "@javaabu/forms/tailwind.css";
```

```tsx
import { OnuProvider, ThemeProvider } from "@javaabu/onu"
import { FormsProvider, mergeAdapters } from "@javaabu/forms"
import { onu } from "@javaabu/forms/onu"
import { onuEditor } from "@javaabu/forms/onu/editor" // only if you use Wysiwyg

const ui = mergeAdapters(onu, onuEditor)

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <OnuProvider>
        <FormsProvider ui={ui}>{children}</FormsProvider>
      </OnuProvider>
    </ThemeProvider>
  )
}
```

## shadcn/ui

See [shadcn/ui](./advanced-usage/shadcn): you make the adapter from your own components with `createShadcnAdapter()`.

## Anything else

Write an adapter for your UI kit, or replace a few components of the HTML adapter. See [UI adapters](./advanced-usage/adapters).

# FormsProvider

`FormsProvider` is the counterpart of `config/forms.php`. Every prop is optional, and nested providers override their parent's.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `ui` | `FormsAdapter` | HTML | The UI adapter |
| `components` | `Partial<FormsComponents>` | | Replaces single components: `{ Select: MySelect }` |
| `router` | `FormsRouter \| null` | native submit | How forms without `onSubmit` submit: `inertia`, `fetchRouter` or your own |
| `translate` | `(text) => string` | `__()` | Translates generated labels and titles |
| `csrfToken` | `string \| null` | `<meta name="csrf-token">` | The `_token` field of non-GET forms |
| `old` | `object \| null` | | Old input for every form |
| `errors` | `PageErrors \| null` | | Validation errors for every form, flat or by error bag |
| `authorize` | `(ability, argument?, guard?) => boolean` | fail closed | Resolves the `can` props of `ConditionalLink` and `NoItems` |
| `settings` | `Record<string, unknown>` | `per_page: 20`, `max_upload_file_size: 10240`, `max_image_file_size: 2048` | `get_setting()` values: upload limits (KB), `per_page`, `default_lat`, `default_lng` |

# Laravel apps

## Blade layout with Inertia

```blade
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() === 'dv' ? 'rtl' : 'ltr' }}">
<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
```

## Inertia setup

```tsx
// resources/js/app.tsx
import { createInertiaApp } from "@inertiajs/react"
import { createRoot } from "react-dom/client"
import { FormsProvider, mergeAdapters } from "@javaabu/forms"
import { inertia, inertiaLinks } from "@javaabu/forms/inertia"
import { onu } from "@javaabu/forms/onu"

const ui = mergeAdapters(onu, inertiaLinks)

createInertiaApp({
  resolve: (name) => import(`./pages/${name}.tsx`),
  setup({ el, App, props }) {
    createRoot(el).render(
      <FormsProvider ui={ui} router={inertia}>
        <App {...props} />
      </FormsProvider>,
    )
  },
})
```

Errors come from the page props by themselves. See [Inertia](./advanced-usage/inertia) for `useForm()`, error bags and visit options.

## Sharing settings, permissions and old input

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'forms' => [
            'settings' => [
                'per_page' => get_setting('per_page'),
                'max_upload_file_size' => get_setting('max_upload_file_size'),
            ],
            'can' => [
                'create_users' => $request->user()?->can('create', User::class),
            ],
        ],
        'old' => fn () => $request->session()->getOldInput(),
    ];
}
```

```tsx
const { forms } = usePage().props

<FormsProvider settings={forms.settings} authorize={(ability) => !!forms.can[ability]}>
```

The Inertia router reads the `old` prop itself. Without Inertia, pass `old` and `errors` to `FormsProvider` from wherever your page gets them.

# Translations

Strings come from [`@javaabu/i18n`](https://github.com/Javaabu/i18n) and follow `<html lang>`. English and Dhivehi are built in, and you change them in `lang/vendor/forms/{locale}/strings.php`. See [Translations](./basic-usage/translations).

# Examples

The repository has a page per adapter in `examples/` (Onu, shadcn/ui and plain HTML), each with a Dhivehi version (`?dv`):

```bash
git clone https://github.com/Javaabu/react-forms && cd react-forms
pnpm install && pnpm examples
```
