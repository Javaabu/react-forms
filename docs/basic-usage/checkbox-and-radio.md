---
title: Checkboxes and radios
sidebar_position: 2.5
---

```blade
<x-forms::checkbox name="send_notifications" />
<x-forms::checkbox name="channels[]" value="email" label="Email" />
<x-forms::radio name="type" value="quiz" label="Quiz" />
```

```tsx
import { Checkbox, Form, Radio, Submit } from "@javaabu/forms"

export function NotificationsForm({ user }) {
  return (
    <Form model={user} action="/settings/notifications" method="PATCH">
      <Checkbox name="send_notifications" label="ނޯޓިފިކޭޝަން ފޮނުވާ" />
      <Checkbox name="newsletter" value="yes" default />
      <Checkbox name="accept_terms" required>
        I agree to the <a href="/terms">terms and conditions</a>.
      </Checkbox>

      <Checkbox name="channels[]" value="email" label="Email" />
      <Checkbox name="channels[]" value="sms" label="SMS" />

      <Radio name="type" value="quiz" label="Quiz" />
      <Radio name="type" value="video" label="Video" />

      <Submit />
    </Form>
  )
}
```

# Checked state

1. **Old input.** Once there is any old input, a box is checked only when the old input contains its `value`. A box that was unchecked on the failed submit stays unchecked.
2. **Bound value.** An array (`channels: ["email"]`) checks the boxes whose `value` it contains. A scalar checks the box by its truthiness (`"0"` and `0` are false). A radio is selected when the bound value equals its `value`.
3. **`default`**, when the bound value is `null`.

An unchecked checkbox submits nothing, as in HTML. Grouped checkboxes (`channels[]`) get unique ids such as `channels-email`, and their errors include the items' errors (`channels.0`). Radios with the same `name` in a form form a group: picking one unselects the others.

# Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| number \| boolean` | `1` | Submitted when checked. |
| `default` | `boolean` | `false` | Checked when the bound value is `null`. |
| `checked` | `boolean` | | Controlled state. Pair it with `onCheckedChange`. |
| `onCheckedChange` | `(checked: boolean) => void` | | |
| `children` | `ReactNode` | | Label beside the box (Blade's default slot). Without it, `label` is used. With `inline`, `label` goes in the label column and `children` beside the box. |
| `className` | `string` | | |

They also take the common field props (`name`, `label`, `id`, `model`, `required`, `disabled`, `inline`, `help`, `showErrors`, …; see [Inputs](./inputs-and-textarea#props)).

# How it renders

The HTML adapter renders native checkboxes and radios inside their `<label>`. The Onu adapter uses Onu's `Checkbox` and a native radio. The shadcn adapter uses your `Checkbox`, and a `RadioGroup` with one `RadioGroupItem` per radio. With shadcn, arrow keys don't move between radios of a group; Tab does.

# Accessibility

Each box and radio is labelled by the text beside it, so clicking the text toggles it. With native radios, arrow keys move within a group.
