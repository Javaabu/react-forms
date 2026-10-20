# React Forms

`@javaabu/react-forms` is the React port of [`javaabu/forms`](https://github.com/Javaabu/forms), the Laravel Blade components. It also covers the form behaviour of [`@javaabu/js-utilities`](https://github.com/Javaabu/js-utilities). It is built on [Onu](https://www.npmjs.com/package/@javaabu/onu), Javaabu's React UI library, so it inherits RTL and Dhivehi support, Thaana typing, theming and WCAG 2.2 AA accessibility.

The API follows the Blade components. Blade attributes become camelCase props, and slots become props or children.

```blade
<x-forms::form :model="$article" method="PATCH" :action="route('articles.update', $article)">
    <x-forms::text name="title" required />
    <x-forms::select2 name="category" :options="$categories" relation />
    <x-forms::checkbox name="is_featured" />
    <x-forms::submit>Save</x-forms::submit>
</x-forms::form>
```

```tsx
import * as Forms from "@javaabu/react-forms"

;<Forms.Form model={article} method="PATCH" action={route("articles.update", article.id)}>
  <Forms.Text name="title" required />
  <Forms.Select2 name="category" options={categories} relation />
  <Forms.Checkbox name="is_featured" />
  <Forms.Submit>Save</Forms.Submit>
</Forms.Form>
```

## Documentation

- [Installation and setup](docs/installation-and-setup.md)
- [Migrating from Blade](docs/migrating-from-blade.md): every component, prop mapping and difference
- Basic usage: [model binding](docs/basic-usage/model-binding.md), [inputs and textarea](docs/basic-usage/inputs-and-textarea.md), [checkboxes and radios](docs/basic-usage/checkbox-and-radio.md), [selects](docs/basic-usage/select-elements.md), [Select2, ajax and cascading selects](docs/basic-usage/select2.md), [dates](docs/basic-usage/dates.md), [files and images](docs/basic-usage/file-inputs.md), [conditional wrapper](docs/basic-usage/conditional-wrapper.md), [forms, buttons and errors](docs/basic-usage/forms-and-buttons.md), [display components](docs/basic-usage/display.md), [listing pages](docs/basic-usage/listing.md), [WYSIWYG](docs/basic-usage/wysiwyg.md), [map input](docs/basic-usage/map-input.md)

## What carries over from Blade

- **Model binding**: `Form model`, `<Model>` (Blade's `@model`), `model={false}`, nested models and relations.
- **Value precedence**: old input, then the bound value, then `default`.
- **Generated labels and ids**: `company_name` → "Company Name" / `company_name`, `address[city]` → `address-city`. Labels go through your translator.
- **Laravel requests**: `_method` spoofing, the `_token` field, `multipart/form-data`, `sync_<name>` fields for multi-selects, `name[]` arrays. Validation errors appear under their fields: `Form` reads a 422 response, Inertia's `errors`, or your `errors` prop.
- **js-utilities behaviour, in React**: `conditionalDisplay`, select2 ajax search, cascading selects with fallback inputs, `fileUploadInput`, `selectAllCheckbox`, `sortable` headings, `animate-submit`, `urlInput`.
- **Strings**: the `en` and `dv` strings of `javaabu/forms`, following Onu's locale.

## Development

```bash
pnpm install
pnpm dev          # playground with every component (add ?dv for Dhivehi)
pnpm test
pnpm lint && pnpm typecheck && pnpm format:check
pnpm build
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
