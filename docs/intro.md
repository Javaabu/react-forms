---
title: Introduction
sidebar_position: 1.0
---

# Forms

[`@javaabu/forms`](https://github.com/Javaabu/react-forms) is the React version of [javaabu/forms](https://github.com/Javaabu/forms), the Laravel Blade form components. The components, attributes, model binding, old input and validation errors are the same, so a form looks and behaves the same in a Blade view and an Inertia React page.

```blade
<x-forms::form :model="$user" method="PATCH" :action="route('users.update', $user)">
    <x-forms::text name="name" required />
    <x-forms::select2 name="country" :options="$countries" relation />
    <x-forms::submit>Save</x-forms::submit>
</x-forms::form>
```

```tsx
import { Form, Select2, Submit, Text } from "@javaabu/forms"
import { update } from "@/actions/App/Http/Controllers/UsersController"

<Form model={user} action={update}>
  <Text name="name" required />
  <Select2 name="country" options={countries} relation />
  <Submit>Save</Submit>
</Form>
```

- **The Blade API in React.** The same component names, attributes as camelCase props, and named slots as props. Ids and labels are generated from names (`address[city]` becomes `address-city` and "Address City").
- **Laravel built in.** Model binding, old input, `_method` spoofing, CSRF tokens, `sync_` fields for multi-selects, relations, and validation errors under the right field. That includes error bags and array keys like `items.0.name`.
- **Any UI framework.** The components render through an adapter: [Onu](https://github.com/Javaabu/onu), [shadcn/ui](./advanced-usage/shadcn), plain HTML, or [your own](./advanced-usage/adapters). Replace a single component for the whole app or for one form.
- **Inertia and Wayfinder.** Forms submit as [Inertia](./advanced-usage/inertia) visits or through `useForm()`, without glue code, and take [Wayfinder](./advanced-usage/wayfinder) routes as their `action`. They also work without either: natively, or with fetch.
- **Dhivehi and RTL.** English and Dhivehi strings through [@javaabu/i18n](https://github.com/Javaabu/i18n), right-to-left layout, and Thaana typing on free-text fields.
- **Accessible.** Labels are tied to their controls, errors are announced and linked with `aria-describedby`, and the first invalid field is focused when errors arrive.

New here? Start with [Installation and setup](./installation-and-setup). Coming from Blade? Read [Migrating from Blade](./migrating-from-blade). Using an AI coding assistant? See [AI assistants](./ai-assistants).
