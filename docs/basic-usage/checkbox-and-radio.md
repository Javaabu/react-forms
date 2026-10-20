---
title: Checkboxes and radios
sidebar_position: 2.5
---

```tsx
<Forms.Checkbox name="send_notifications" />
<Forms.Checkbox name="newsletter" value="yes" default />
<Forms.Checkbox name="accept_terms" required>
  I agree to the <a href="/terms">terms and conditions</a>.
</Forms.Checkbox>

<Forms.Form model={{ channels: ["email"] }}>
  <Forms.Checkbox name="channels[]" value="email" label="Email" />
  <Forms.Checkbox name="channels[]" value="sms" label="SMS" />
</Forms.Form>

<Forms.Radio name="type" value="quiz" label="Quiz" />
<Forms.Radio name="type" value="video" label="Video" />
```

## Checked state

1. **Old input**: when there is old input, the box is checked only if it contains `value`.
2. **Bound value**: an array is checked when it contains `value`. A scalar is checked by its truthiness (`"0"` and `0` are false). For radios, the scalar must equal `value`.
3. **`default`**: when the bound value is `null`.

An unchecked checkbox submits nothing, as in HTML. Grouped checkboxes (`channels[]`) get unique ids such as `channels-email`.

## Options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| number \| boolean` | `1` | Submitted when checked. |
| `default` | `boolean` | `false` | Checked when the bound value is `null`. |
| `checked` | `boolean` | | Controlled state (checkbox). |
| `children` | `ReactNode` | | Label beside the box. With `inline`, the `label` goes in the label column. |

They also take the common field props (`name`, `label`, `model`, `required`, `inline`, `help`, `showErrors`, …).

## Accessibility

The checkbox is Onu's `Checkbox`, and its label is clickable. Radios are native inputs, so arrow keys move within a group.
