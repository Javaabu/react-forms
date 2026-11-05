# Custom fields

A field that isn't one of the package's (a block editor, media picker, menu builder, colour picker) plugs into `Form` with the hooks the built-in fields use. Full guide: `node_modules/@javaabu/forms/docs/advanced-usage/custom-fields.md`.

```tsx
import {
  splitFieldProps,
  useField,
  useFieldState,
  useFieldValue,
  usePublishField,
  type FieldProps,
} from "@javaabu/forms"

export interface ColourFieldProps extends FieldProps {
  colours: string[]
}

export function ColourField(props: ColourFieldProps): React.JSX.Element {
  const { field, rest } = splitFieldProps(props) // FieldProps apart from the control's props
  const f = useField(field) // id, label, errors, ARIA, wrap()
  const initial = String(useFieldValue(field.name, field.model, field.default) ?? "") // old input → model → default
  const [colour, setColour] = useFieldState(field.name, initial) // useForm() data, reset, clears errors
  usePublishField({
    id: f.id,
    name: field.name,
    kind: "value",
    value: colour,
    disabled: f.disabled,
    label: f.labelText,
  })

  return f.wrap(
    <div
      role="radiogroup"
      id={f.id}
      aria-labelledby={`${f.baseId}-label`}
      aria-describedby={f.describedBy}
      aria-invalid={f.invalid || undefined}
    >
      {rest.colours.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={colour === option}
          onClick={() => setColour(option)}
        >
          {option}
        </button>
      ))}
      <input type="hidden" name={field.name} value={colour} disabled={f.disabled} />
    </div>,
  )
}
```

- Extend `FieldProps` so the field takes `name`, `label`, `model`, `default`, `required`, `help`, … like every other field.
- Render a hidden input (JSON for structured values) when the control isn't a native input: plain, fetch and Inertia-router forms read the form's inputs.
- On a native control spread `f.control`; on anything else set `id`, `aria-labelledby`, `aria-describedby` and `aria-invalid` as above.
- Controlled: `useFieldState(name, initial, { controlled: value })`. Store conversion: `toStore` / `fromStore`. A starting value that loads later: `key`.
- Errors on nested keys (`body.content.2`): read `useFormState()?.errors`.
- Give exported components an explicit return type (`React.JSX.Element`).
- Test it inside a `Form`: check `new FormData(form)`, errors, and `ConditionalWrapper`.
