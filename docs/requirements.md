---
title: Requirements
sidebar_position: 1.1
---

- React 18.3 or 19
- [`@javaabu/i18n`](https://github.com/Javaabu/i18n), installed with the package
- A bundler that reads `package.json` `exports` (Vite, webpack 5, Rspack, Next.js)

Everything else is optional, and only needed for the entry point that uses it:

| You use | Install |
| --- | --- |
| `@javaabu/forms/onu` | `@javaabu/onu` 0.2.1 or later, and Tailwind CSS v4 |
| `@javaabu/forms/onu/editor` | Onu's editor peers: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit` and the extensions Onu lists |
| `@javaabu/forms/onu/maps` | Onu's map peers (`@vis.gl/react-google-maps`, `terra-draw`, …) |
| `@javaabu/forms/shadcn` | Your app's shadcn/ui components |
| `@javaabu/forms/inertia` | `@inertiajs/react` 2 or 3 |
| Wayfinder routes | [Laravel Wayfinder](https://github.com/laravel/wayfinder). Nothing to install in JavaScript |
| `@javaabu/forms/testing` | `@testing-library/react` 16, and jsdom or happy-dom |

On the Laravel side nothing is required. The [Laravel apps section](./installation-and-setup#laravel-apps) shows how to share CSRF tokens, old input and errors.
