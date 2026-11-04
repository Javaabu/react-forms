# Forms for React

[![Tests](https://github.com/Javaabu/react-forms/actions/workflows/ci.yml/badge.svg?branch=next-gen)](https://github.com/Javaabu/react-forms/actions/workflows/ci.yml?query=branch%3Anext-gen)
[![Coverage](https://codecov.io/gh/Javaabu/react-forms/branch/next-gen/graph/badge.svg)](https://codecov.io/gh/Javaabu/react-forms/tree/next-gen)
[![npm](https://img.shields.io/npm/v/@javaabu/forms.svg)](https://www.npmjs.com/package/@javaabu/forms)
[![License](https://img.shields.io/github/license/Javaabu/react-forms.svg)](LICENSE.md)

`@javaabu/forms` is the React version of [javaabu/forms](https://github.com/Javaabu/forms), the Laravel Blade form components. It has the same components and attributes, model binding, old input and validation errors, so a form looks and behaves the same in a Blade view and an Inertia React page. It renders with [Onu](https://github.com/Javaabu/onu), shadcn/ui, plain HTML or your own UI kit.

```blade
<x-forms::form :model="$article" method="PATCH" :action="route('articles.update', $article)">
    <x-forms::text name="title" required />
    <x-forms::select2 name="category" :options="$categories" relation />
    <x-forms::checkbox name="is_featured" />
    <x-forms::submit>Save</x-forms::submit>
</x-forms::form>
```

```tsx
import { Checkbox, Form, Select2, Submit, Text } from "@javaabu/forms"
import { update } from "@/actions/App/Http/Controllers/ArticlesController"

;<Form model={article} action={update}>
  <Text name="title" required thaana />
  <Select2 name="category" options={categories} relation />
  <Checkbox name="is_featured" />
  <Submit>Save</Submit>
</Form>
```

## Features

- **The Blade API.** The same component names, camelCase attributes, generated ids and translated labels.
- **Laravel built in.** Model binding, old input, method spoofing, CSRF, relations, `sync_` fields, and validation errors under the right field, including error bags and `items.0.name` keys.
- **Any UI.** Adapters for Onu, shadcn/ui and plain HTML, a typed adapter contract with a conformance test kit, and per-component overrides.
- **Inertia and Wayfinder.** Forms submit as Inertia visits, or through `useForm()`, without glue code, and take Wayfinder routes as `action`. They also submit natively or with fetch.
- **Dhivehi and RTL.** English and Dhivehi strings with [@javaabu/i18n](https://github.com/Javaabu/i18n), RTL layouts and Thaana typing.

## Installation

```bash
npm install @javaabu/forms
```

```tsx
import { FormsProvider } from "@javaabu/forms"
import { inertia } from "@javaabu/forms/inertia"
import { onu } from "@javaabu/forms/onu"

;<FormsProvider ui={onu} router={inertia}>
  {children}
</FormsProvider>
```

See [Installation and setup](docs/installation-and-setup.md).

## Documentation

The full documentation is in [`docs/`](docs/intro.md), with an index for AI assistants in [`llms.txt`](llms.txt). Start with:

- [Installation and setup](docs/installation-and-setup.md)
- [Forms and buttons](docs/basic-usage/forms-and-buttons.md), [model binding](docs/basic-usage/model-binding.md), [validation errors](docs/basic-usage/errors.md)
- [UI adapters](docs/advanced-usage/adapters.md), [shadcn/ui](docs/advanced-usage/shadcn.md), [Inertia](docs/advanced-usage/inertia.md), [Wayfinder](docs/advanced-usage/wayfinder.md)
- [Migrating from Blade](docs/migrating-from-blade.md), [upgrading from @javaabu/react-forms](docs/upgrading.md), [parity with javaabu/forms](docs/parity.md)

## Development

```bash
pnpm install
pnpm examples   # one page per adapter (add ?dv for Dhivehi)
pnpm check      # lint, format, typecheck, tests, build, examples
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
