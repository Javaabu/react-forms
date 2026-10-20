---
title: Date, datetime and time
sidebar_position: 4.5
---

```tsx
<Forms.Date name="expires_at" />
<Forms.Datetime name="published_at" required />
<Forms.Time name="opens_at" placeholder="Opening time" />
```

These use Onu's `DatePicker`, `DateTimePicker` and `TimePicker`. Bound values can be `2024-05-01`, `2024-05-01 10:30:00`, ISO strings (`…Z`), times (`10:30`) or `Date` objects. Strings without a time zone are read as local time.

They submit `yyyy-MM-dd`, `yyyy-MM-ddTHH:mm:ss` and `HH:mm`, which Laravel's date validation and casts accept.

They take the common field props, plus Onu's picker props: `format` (date-fns display format), `min`, `max`, `clearable`, `hourCycle`, `minuteStep`, ….

## Accessibility

The picker is a button that opens a dialog with a keyboard-navigable calendar. Phones get a bottom sheet.
