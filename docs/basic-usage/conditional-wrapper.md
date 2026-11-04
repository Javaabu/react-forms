---
title: Conditional Wrapper
sidebar_position: 6
---

`ConditionalWrapper` enables, and optionally shows, a group of fields depending on another field. It is js-utilities' `data-enable-section-value` and `data-enable-section-checkbox` for React.

```blade
<x-forms::conditional-wrapper enable-elem="#type" enable-value="quiz" hide-fields>
    <x-forms::datetime name="expires_at" />
</x-forms::conditional-wrapper>
```

```tsx
import { Checkbox, ConditionalWrapper, Datetime, Form, Select2, Text } from "@javaabu/forms"

export function QuestionForm() {
  return (
    <Form action="/questions">
      <Select2 name="type" options={{ quiz: "Quiz", video: "Video" }} />

      <ConditionalWrapper enableElem="#type" enableValue="quiz" hideFields>
        <Datetime name="expires_at" />
      </ConditionalWrapper>

      <Checkbox name="online_interview" />
      <ConditionalWrapper enableElem="#online_interview" enableCheckbox disable hideFields>
        <Text name="venue" label="ތަން" />
      </ConditionalWrapper>
    </Form>
  )
}
```

# How it matches

- With `enableValue`, the section is enabled when the field's value is one of the values (compared as strings). A multi-select matches when any of its values does.
- Without `enableValue`, any non-empty value enables it (`""`, `"0"`, `0`, `false` and `[]` are empty).
- With `enableCheckbox`, the checkbox's checked state is followed.
- `disable` inverts the match: the section is disabled when it matches.

# Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `enableElem` | `string` | **Required** | The field to follow: `#id`, `[name=x]` or a name. |
| `enableValue` | `unknown` | | Value, or list of values, that enable the section. |
| `hideFields` | `boolean` | `false` | Also hide the section while it is disabled. |
| `disable` | `boolean` | `false` | Disable the section when the value matches. |
| `enableCheckbox` | `boolean` | `false` | Follow the checkbox's checked state. |

Other `<fieldset>` attributes are passed through.

`enableElem` finds this package's fields by id or name, anywhere on the page. It also finds plain `<input>`, `<select>` and `<textarea>` elements you wrote yourself, as jQuery did.

# What it renders

A `<fieldset>` without a border, whatever the adapter. While disabled, the fieldset is `disabled`, so the browser doesn't submit its fields; with `hideFields` it is also `hidden`. `data-state` is `enabled`, `disabled` or `hidden`, for styling.

# Accessibility

Disabled fields are announced as disabled, and hidden sections are removed from the accessibility tree.
