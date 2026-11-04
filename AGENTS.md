# Forms for React: notes for AI coding agents

`@javaabu/forms` is the React version of the [`javaabu/forms`](https://github.com/Javaabu/forms) Blade components (repo `Javaabu/react-forms`). The core is UI-framework-agnostic: components render through adapter slots (Onu, shadcn/ui, plain HTML). Strings come from [`@javaabu/i18n`](https://github.com/Javaabu/i18n).

## Layout

| Path                                      | What                                                                                                                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/core`                                | No UI imports. `FormsProvider`, the adapter contract (`adapter.ts`), binding and old input, errors, form state, the field registry, routers (fetch, Wayfinder resolution), strings, Thaana |
| `src/components`                          | The Blade components. They resolve names, ids, values and errors (`useField`, `useFieldState`), then render `useUi()` slots                                                                |
| `src/adapters/html`                       | The default adapter and the reference implementation of every slot                                                                                                                         |
| `src/adapters/onu`, `src/adapters/shadcn` | The Onu adapter (+ `editor`, `maps`) and `createShadcnAdapter()`                                                                                                                           |
| `src/inertia`                             | The Inertia router and `inertiaLinks` (`@javaabu/forms/inertia`)                                                                                                                           |
| `src/testing`                             | The adapter conformance kit (`@javaabu/forms/testing`)                                                                                                                                     |
| `src/support`                             | Ports of the Laravel / javaabu helpers (`Str`, `data_get`, `AllowedMimeTypes`, …)                                                                                                          |
| `src/core/locales`                        | `en` / `dv` lines, keyed like Blade's `lang/*/strings.php`                                                                                                                                 |
| `src/*.ts`                                | Entry points, mirrored by `package.json` `exports` and `vite.config.ts`                                                                                                                    |
| `test/shadcn`                             | Stock shadcn/ui components from the registry, for the adapter's tests. Don't edit them                                                                                                     |
| `examples`                                | `pnpm examples`: one page per adapter (`?dv` for Dhivehi)                                                                                                                                  |
| `docs`                                    | Docusaurus docs; `llms.txt` indexes every page; `docs/parity.md` is the Blade parity matrix                                                                                                |
| `resources/boost`                         | Laravel Boost guideline and the `javaabu-react-forms` skill                                                                                                                                |

## Rules

- Keep the Blade API: same component names (PascalCase), attributes (camelCase), value precedence, labels and ids. Record every component, attribute and behaviour change in `docs/parity.md`, and intentional differences in `docs/migrating-from-blade.md`.
- `src/core` and `src/components` never import a UI kit. New UI needs a slot in `src/core/adapter.ts`, an HTML implementation, adapter implementations where they exist, and a conformance case in `src/testing`.
- Slots are controlled, submit natively, and put `id` / `aria-*` on the focusable element (see `docs/advanced-usage/adapters.md`).
- No hard-coded English: add the line to `src/core/locales/en.ts` and `dv.ts` (real Dhivehi; list uncertain lines in `docs/advanced-usage/dhivehi-and-rtl.md`), read it with `useFormsTranslation().t()`. Keys match Blade's `forms::strings.*`.
- Logical CSS only (`ms-`, `pe-`, `start-`, `text-start`); ESLint rejects physical utilities.
- Every change needs tests (`*.test.ts(x)` next to the code, Thaana in user-facing cases), docs (and `llms.txt` / `docs/api-reference.md` for new pages or exports; `src/docs.test.ts` checks them) and a changeset (`pnpm changeset`).
- Work on the `next-gen` branch. Don't commit to `main`, tag or publish.

## Commands

```bash
pnpm install
pnpm check      # lint, format, typecheck, test, build, examples: run before every push
pnpm test
pnpm examples
```
