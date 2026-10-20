---
title: Conditional Wrapper
sidebar_position: 6
---

`ConditionalWrapper` brings js-utilities' `data-enable-section-value` and `data-enable-section-checkbox` to React. It enables, and optionally shows, its fields depending on another field.

```tsx
<Forms.Select2 name="type" options={{ quiz: "Quiz", video: "Video" }} />

<Forms.ConditionalWrapper enableElem="#type" enableValue="quiz" hideFields>
  <Forms.Datetime name="expires_at" />
</Forms.ConditionalWrapper>

<Forms.ConditionalWrapper enableElem="#online_interview" enableCheckbox hideFields disable>
  This section is hidden when the checkbox is checked.
</Forms.ConditionalWrapper>
```

| Prop | Default | Description |
| --- | --- | --- |
| `enableElem` | **Required** | The field to follow: `#id`, `[name=x]` or a name. |
| `enableValue` | | Value(s) that enable the section (compared as strings). |
| `hideFields` | `false` | Also hide the section while disabled. |
| `disable` | `false` | Invert: disable when the value matches. |
| `enableCheckbox` | `false` | Follow the checkbox's checked state. |

`enableElem` finds this package's fields by id or name. It also finds plain inputs, selects and textareas in the page, by `#id` or name, as jQuery did.

A disabled section is a disabled `<fieldset>`, so its fields are not submitted.

## Accessibility

Hidden sections are removed from the accessibility tree, and disabled fields are announced as disabled.
