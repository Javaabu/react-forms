# Adapters

Components render through the slots of the `FormsProvider ui` adapter. Missing slots render plain HTML.

- Onu: `onu` from `@javaabu/forms/onu`, plus `onuEditor` (`/onu/editor`) and `onuMaps` (`/onu/maps`), combined with `mergeAdapters()`.
- shadcn/ui: `createShadcnAdapter({ Button, Input, Label, … })` from `@javaabu/forms/shadcn` with the app's own `@/components/ui/*` components. Searchable and multiple selects need `Popover` and `Command`.
- Inertia links: `inertiaLinks` from `@javaabu/forms/inertia`, merged into the adapter.

Replace a slot for the app, part of the page or one form:

```tsx
import type { SelectSlotProps } from "@javaabu/forms"

function CountrySelect({ options, value, onValueChange, name, multiple, ...props }: SelectSlotProps) {
  // Render `value`, report changes with onValueChange, and keep `name` in the form's FormData.
}

<FormsProvider components={{ Select: CountrySelect }}>…</FormsProvider>
<Form components={{ Select: CountrySelect }}>…</Form>
```

Slot rules: controlled values (`value` + `onValueChange`, or spread the native props of `Input` / `Textarea`); a named control must submit natively (a native or hidden input); `id`, `aria-invalid` and `aria-describedby` go on the focusable element; the `Field` label already contains the required marker; logical CSS only.

Test an adapter with `testAdapter(myAdapter)` from `@javaabu/forms/testing` (Vitest or Jest, jsdom, `@testing-library/react`). Every slot's props type is exported as `…SlotProps`.
