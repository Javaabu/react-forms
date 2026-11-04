---
title: Date, datetime and time
sidebar_position: 4.5
---

```blade
<x-forms::date name="expires_at" />
<x-forms::datetime name="published_at" required />
<x-forms::time name="opens_at" />
```

```tsx
import { Date, Datetime, Form, Submit, Time } from "@javaabu/forms"

export function EventForm({ event }) {
  return (
    <Form model={event} action={`/events/${event.id}`} method="PATCH">
      <Date name="expires_at" min="2026-01-01" />
      <Datetime name="published_at" required />
      <Time name="opens_at" placeholder="ހުޅުވާ ގަޑި" />
      <Submit />
    </Form>
  )
}
```

`Date` shadows the global `Date` in a module that imports it. Import it under another name if you need both: `import { Date as DateField } from "@javaabu/forms"`.

# Values

Bound values can be what Laravel sends: `2026-11-04`, `2026-11-04 09:30:00`, ISO strings (`2026-11-04T09:30:00.000000Z`), times (`09:30`), timestamps or `Date` objects. Strings without a time zone are read as local time.

The fields submit:

| Component | Submits |
| --- | --- |
| `Date` | `yyyy-MM-dd` |
| `Datetime` | `yyyy-MM-dd HH:mm:ss` |
| `Time` | `HH:mm` |

Laravel's `date` rule and date casts accept all three.

# Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `Date \| string \| null` | Controlled value. |
| `onChange` | `(value: string, date: Date \| null) => void` | The new value, as submitted, and as a `Date`. |
| `min`, `max` | `Date \| string` | Earliest and latest value. |
| `placeholder`, `showPlaceholder` | `string`, `boolean` | |
| `className` | `string` | |

Plus the common field props ([Inputs](./inputs-and-textarea#props)).

# How it renders

The adapter picks the control. The HTML adapter renders native `<input type="date">`, `datetime-local` and `time` inputs. The shadcn adapter renders the same native inputs with your `Input`. The Onu adapter uses Onu's `DatePicker`, `DateTimePicker` and `TimePicker`. Each one also renders a hidden input that submits the format above, whatever the picker shows.

# Accessibility

Native inputs follow the browser's date picker. Onu's pickers open a dialog with a keyboard-navigable calendar, and a bottom sheet on phones.
