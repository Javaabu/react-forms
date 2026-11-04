---
title: UI adapters
sidebar_position: 1
---

The components don't draw anything themselves. Each one works out its name, id, label, value, errors and ARIA attributes, then renders a **slot** of the active **adapter**. An adapter maps slots to a UI framework's components.

| Adapter         | Import                                      | Notes                                                       |
| --------------- | ------------------------------------------- | ----------------------------------------------------------- |
| HTML (default)  | `html` from `@javaabu/forms/html`           | Plain, unstyled elements with `data-slot` attributes        |
| Onu             | `onu` from `@javaabu/forms/onu`             | Javaabu's React UI library                                  |
| Onu editor      | `onuEditor` from `@javaabu/forms/onu/editor` | Onu's Tiptap editor for `Wysiwyg`                           |
| Onu maps        | `onuMaps` from `@javaabu/forms/onu/maps`    | Onu's Google Maps pickers for `MapInput`                    |
| shadcn/ui       | `createShadcnAdapter()` from `@javaabu/forms/shadcn` | Made from your app's own shadcn components ([shadcn/ui](./shadcn)) |

# Choosing an adapter

```tsx
import { FormsProvider, mergeAdapters } from "@javaabu/forms"
import { onu } from "@javaabu/forms/onu"
import { onuEditor } from "@javaabu/forms/onu/editor"

const ui = mergeAdapters(onu, onuEditor)

export function App({ children }) {
  return <FormsProvider ui={ui}>{children}</FormsProvider>
}
```

`mergeAdapters()` combines adapters slot by slot; later ones win. Define the merged adapter once, outside your components, so it keeps its identity.

Any slot an adapter leaves out renders with the HTML adapter, so an adapter can be partial.

# Replacing single components

Pass `components` to a `FormsProvider` (for the app or a part of the page), or to one `Form`:

```tsx
import { FormsProvider, type SelectSlotProps } from "@javaabu/forms"

function CountrySelect(props: SelectSlotProps) {
  // Your own select. It gets the resolved options, value, name, id and ARIA props.
  return <MyFancySelect {...props} />
}

<FormsProvider ui={onu} components={{ Select: CountrySelect }}>…</FormsProvider>

<Form action={store()} components={{ Select: CountrySelect }}>…</Form>
```

The order is: `components` of the nearest provider or form, then the `ui` adapter, then the HTML adapter.

# Writing an adapter

An adapter is a plain object. Type it with `defineAdapter()`:

```tsx
import { defineAdapter, type InputSlotProps, type FieldSlotProps } from "@javaabu/forms"
import { Input } from "my-ui"

function MyInput({ prepend, append, thaana, thaanaToggle, ...props }: InputSlotProps) {
  // `props` are native <input> attributes: name, id, type, value, onChange, required, aria-*…
  return <Input {...props} leading={prepend} trailing={append} />
}

function MyField({ id, label, hideLabel, help, helpId, errors, errorId, children }: FieldSlotProps) {
  return (
    <div className="field">
      {label ? (
        <label htmlFor={id} className={hideLabel ? "sr-only" : undefined}>
          {label}
        </label>
      ) : null}
      {children}
      {help ? <p id={helpId}>{help}</p> : null}
      {errors.length ? (
        <div id={errorId} aria-live="polite">
          {errors.map((e) => <p key={e}>{e}</p>)}
        </div>
      ) : null}
    </div>
  )
}

export const myUi = defineAdapter({
  name: "my-ui",
  components: { Input: MyInput, Field: MyField },
  // Optional: dialogs and notifications for file uploads.
  confirm: (options) => myConfirm(options),
  notify: (message, { type } = {}) => myToast(message, type),
})
```

The source of the HTML adapter (`src/adapters/html/index.tsx`) is the reference: every slot, in plain elements.

## Rules

1. **Controlled values.** Value slots get `value` (or `checked`) and report changes with `onValueChange` / `onCheckedChange`. `Input` and `Textarea` get native props with a controlled `value` and an `onChange`: spread them onto the element. Don't keep your own copy of the value.
2. **Native submit works.** A control with a `name` puts its value into the form's `FormData` under that name, with a native input or a hidden one. A multiple `Select` gets a name that ends in `[]`; submit one entry per value. A `name` of `""` means "don't submit" (uploading file inputs).
3. **ARIA on the focusable element.** Put `id`, `aria-invalid` and `aria-describedby` on the element that takes focus, so labels, errors and "focus the first invalid field" work.
4. **The label is ready.** `Field`'s `label` already includes the required marker. Render it inside a `<label htmlFor={id}>`. With `hideLabel`, hide it visually but keep it for screen readers.
5. **Logical CSS.** Use `ms-`/`pe-`/`start-`, not `left`/`right`, so the adapter works in Dhivehi (RTL).
6. **Keep hidden content mounted.** Inactive tab panels and closed accordion items stay mounted, so their fields keep their values and submit, as in Blade. Open them on the `forms:reveal` event (sent before an invalid field is focused): `TabPanel` and `useReveal` from `@javaabu/forms` do both.
7. **Loading buttons stay enabled.** Show `loading` with `aria-busy` and ignore clicks, but don't set `disabled`: the submit button starts loading during its own click, and a button that becomes disabled then doesn't submit the form.
8. **Thaana.** When `Input` or `Textarea` gets `thaana`, let users type Thaana: use your kit's support, or `onKeyDown={thaanaKeyDown}` from `@javaabu/forms`.

## Slots

| Slot | Props type | Renders |
| --- | --- | --- |
| `Form` | `FormSlotProps` | The `<form>` (native props, plus `processing`) |
| `Field` | `FieldSlotProps` | Label, control, help text and errors |
| `Label`, `RequiredMarker`, `HelpText`, `FieldErrors` | `…SlotProps` | The parts of a field (the HTML `Field` uses these slots) |
| `ErrorSummary` | `ErrorSummarySlotProps` | The error list at the top of a form. Call `onSelect(name)` from each entry |
| `Input` | `InputSlotProps` | Text-like `<input>`s: `text`, `email`, `password`, `url`, `tel`, `search` |
| `Textarea` | `TextareaSlotProps` | `<textarea>` |
| `Number` | `NumberSlotProps` | A number input (`value: number \| null`) |
| `Checkbox`, `Radio` | `CheckboxSlotProps`, `RadioSlotProps` | One box or radio with its label beside it. `checked` may be `"indeterminate"` |
| `Select` | `SelectSlotProps` | Single, multiple, searchable, creatable (tags) and server-searched (`remote`) selects. Without your own async select, use `useRemoteOptions(remote, query)` |
| `Date` | `DateSlotProps` | Date, date-time and time pickers. `value` is the submitted string (`yyyy-MM-dd`, `yyyy-MM-dd HH:mm:ss`, `HH:mm`) |
| `File`, `Image` | `FileSlotProps`, `ImageSlotProps` | File input; image input with a preview |
| `Wysiwyg` | `WysiwygSlotProps` | A rich text editor that reports HTML |
| `Map` | `MapSlotProps` | A map to pick a point, a radius or polygons. `MapInput` renders the coordinate fields itself |
| `Button`, `LinkButton`, `Link`, `ButtonGroup`, `Icon`, `ActionMenu` | `…SlotProps` | Buttons (`color` is a Blade colour: `primary`, `danger`, `outline-secondary`, …), links (an Inertia adapter can swap `Link`), icons by name |
| `Alert`, `Card`, `CardHeader`, `CardTitle`, `CardSubtitle`, `CardFooter`, `Accordion`, `Tabs`, `NavTabs`, `Modal`, `Status`, `DescriptionList`, `DescriptionItem` | `…SlotProps` | Display components |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `EmptyState`, `Pagination` | native props, `EmptyStateSlotProps`, `PaginationSlotProps` | Listing pages |

Every props type is exported from `@javaabu/forms`.

# Testing an adapter

`@javaabu/forms/testing` has conformance tests that render every component through your adapter and check the rules above (labels, values, `FormData`, errors and ARIA, display content). They need a DOM (jsdom or happy-dom) and `@testing-library/react`:

```ts
// my-adapter.test.tsx (Vitest with globals, or Jest)
import { testAdapter } from "@javaabu/forms/testing"
import { myUi } from "./my-adapter"

testAdapter(myUi)
```

Without test globals, pass the functions: `testAdapter(myUi, { describe, it })`. Skip a case your kit can't render in jsdom with `skip: ["Date and Time submit Laravel's formats"]`, or wrap renders in your kit's provider with `wrapper`. For other runners, `adapterConformance(myUi)` returns the cases as `{ name, run }` objects.
