# React Forms: notes for AI coding agents

`@javaabu/react-forms` is the React port of the [`javaabu/forms`](https://github.com/Javaabu/forms) Blade components and the form behaviour of [`@javaabu/js-utilities`](https://github.com/Javaabu/js-utilities), built on [`@javaabu/onu`](https://github.com/Javaabu/onu).

## Layout

| Path                     | What                                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components`         | Components, grouped as in Blade (`inputs`, `select`, `checkbox`, `files`, `display`, `listing`, …)                                        |
| `src/context`            | `FormsProvider` (config, strings, settings), model binding / old input, and the field registry (stand-in for js-utilities' DOM selectors) |
| `src/support`            | Ports of the Laravel / javaabu helpers (`Str`, `data_get`, `AllowedMimeTypes`, …)                                                         |
| `src/locales`            | `en` / `dv` strings (from `lang/*/strings.php`)                                                                                           |
| `src/editor`, `src/maps` | Separate entries for the heavy Onu editor and maps                                                                                        |
| `playground`             | `pnpm dev`: every component on one page (`?dv` for Dhivehi)                                                                               |
| `docs`                   | One page per Blade docs page, plus `migrating-from-blade.md`                                                                              |

## Rules

- Keep the Blade API: same component names (PascalCase) and attributes (camelCase), same value precedence, labels and ids. Note intentional differences in `docs/migrating-from-blade.md`.
- Build on Onu components; don't add other UI kits. Logical Tailwind utilities only (`ms-`, `pe-`, `text-start`); theme tokens only.
- No hard-coded English: strings live in `src/locales/{en,dv}.ts` and are read with `useFormsTranslation()`.
- Every change needs tests (`*.test.ts(x)` next to the code), docs and a changeset (`pnpm changeset`).

## Commands

```bash
pnpm install
pnpm lint && pnpm format:check && pnpm typecheck
pnpm test
pnpm build
pnpm dev
```
