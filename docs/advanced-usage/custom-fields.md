---
title: Custom fields
sidebar_position: 1.8
---

A field from another package (a block editor, a media picker, a menu builder) or from your app can plug into a `Form` the way the built-in fields do: label, help and errors in the adapter's field wrapper, the bound model and old input, Inertia `useForm()` data, `resetOnSuccess`, `ConditionalWrapper`, and errors that clear when the field is edited. The built-in fields use these hooks, all exported from `@javaabu/forms`:

| Hook | Gives the field |
| --- | --- |
| `splitFieldProps(props)` | `{ field, rest }`: the [shared field props](../basic-usage/inputs-and-textarea) (`name`, `label`, `model`, `default`, `required`, `help`, …) apart from your control's own props. |
| `useField(field)` | The id, label, errors, `invalid`, `disabled`, `describedBy`, the ARIA props of the control (`control`) and `wrap()`, which puts the control in the adapter's field with its label, help and errors. |
| `useFieldValue(name, model, default)` | The starting value: old input, then the bound model, then `default`. |
| `useFieldState(name, initial, options?)` | `[value, setValue]`. Reads and writes Inertia `useForm()` data when the form has it, returns to `initial` on `resetOnSuccess`, and clears the field's errors when set. |
| `usePublishField(entry)` | Publishes the value, so `ConditionalWrapper`, `useWatchField` and error summary labels see the field. |

# Example

A colour picker with swatch buttons instead of a native input. This is how `Wysiwyg` is written.

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
  onChange?: (colour: string) => void
}

export function ColourField(props: ColourFieldProps): React.JSX.Element {
  const { field, rest } = splitFieldProps(props)
  const f = useField(field)
  const initial = String(useFieldValue(field.name, field.model, field.default) ?? "")
  const [colour, setColour] = useFieldState(field.name, initial)

  usePublishField({ id: f.id, name: field.name, kind: "value", value: colour, disabled: f.disabled, label: f.labelText })

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
          disabled={f.disabled}
          onClick={() => {
            setColour(option)
            rest.onChange?.(option)
          }}
        >
          {option}
        </button>
      ))}
      {/* Native and fetch submits read the form's inputs. */}
      <input type="hidden" name={field.name} value={colour} disabled={f.disabled} />
    </div>,
  )
}
```

```tsx
<Form model={article} action={update}>
  <ColourField name="colour" colours={["ރަތް", "ނޫ"]} help="The card's colour." />
  <ConditionalWrapper enableElem="#colour" enableValue="ނޫ">
    <Text name="shade" />
  </ConditionalWrapper>
</Form>
```

With Inertia's `useForm()`, the field reads and writes `form.data.colour` with no `value` or `onChange`:

```tsx
const form = useForm({ colour: article.colour })

<Form form={form} action={update()}>
  <ColourField name="colour" colours={["ރަތް", "ނޫ"]} />
</Form>
```

# Checklist

- **Submit natively.** A plain `Form`, `fetchRouter` and the Inertia router read the form's inputs. If the control isn't a native input, render a hidden input with `name` and the value (a structured value as JSON). With `useForm()`, the data comes from `form.data` instead.
- **Label the control.** Put `f.control` on a native control (`id`, `name`, `required`, `disabled`, `aria-invalid`, `aria-describedby`). On anything else, set `id`, `aria-labelledby={`${f.baseId}-label`}`, `aria-describedby={f.describedBy}` and `aria-invalid` yourself. The id is what `ConditionalWrapper enableElem="#colour"` and the error summary's links find.
- **Controlled use.** Pass the user's `value` as `useFieldState(name, initial, { controlled: value })`. It wins over the store and the field's own state.
- **Values that differ from the store's.** `toStore` and `fromStore` convert between the field's value and what `useForm()` data holds (for example a parsed document and its JSON string).
- **Starting value that arrives later.** Pass `key` (for example the model's id) to start again from the new `initial` when it changes. By default the field restarts when `initial` changes.
- **Managing the store yourself.** `store: false` keeps `useFieldState` away from `useForm()` data.
- **Errors on parts of the value.** `useField` shows the errors for `name`. For errors on nested keys (`body.content.2.attrs.url`), read `useFormState()?.errors` and show them where they belong.
- **Typing.** Give exported components an explicit return type (`React.JSX.Element`), so declarations build anywhere (see [#20](https://github.com/Javaabu/react-forms/issues/20)).

# Testing

Render the field inside a `Form` and check what it submits, as the package's own tests do:

```tsx
const { container } = render(
  <Form model={{ colour: "ރަތް" }}>
    <ColourField name="colour" colours={["ރަތް", "ނޫ"]} />
  </Form>,
)
fireEvent.click(screen.getByText("ނޫ"))
expect(new FormData(container.querySelector("form")!).get("colour")).toBe("ނޫ")
```
