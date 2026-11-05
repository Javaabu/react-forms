---
title: Display components
sidebar_position: 9.5
---

These show content rather than collect it. Each renders through the adapter's slot of the same name ([UI adapters](../advanced-usage/adapters)).

# Alert

```blade
<x-forms::alert type="success" heading="Application submitted" dismissible>
    We have received your application.
</x-forms::alert>
```

```tsx
import { Alert } from "@javaabu/forms"

<Alert type="success" heading="ހުށަހެޅިއްޖެ" dismissible>
  We have received your application.
</Alert>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `string` | `primary` | Bootstrap alert type: `primary`, `info`, `success`, `warning`, `danger`. |
| `heading` | `ReactNode` | | Heading above the message. |
| `icon` | `ReactNode` | | An icon. A string with spaces is used as CSS classes (`"fa-solid fa-circle-info"`), as in Blade. |
| `dismissible` | `boolean` | `false` | A close button (HTML and Onu adapters). |
| `className`, `children` | | | |

# Card

```tsx
import { Card, CardFooter, CardHeader, CardSubtitle, CardTitle, Submit } from "@javaabu/forms"

<Card title="Details" subtitle="Last updated today" footer={<Submit>ސޭވްކުރޭ</Submit>}>
  …
</Card>

{/* Or build it from the parts, like Blade's card.header, card.title, … */}
<Card>
  <CardHeader>
    <CardTitle>Details</CardTitle>
    <CardSubtitle>Last updated today</CardSubtitle>
  </CardHeader>
  …
  <CardFooter>…</CardFooter>
</Card>
```

`Card` takes `title`, `subtitle`, `header` (used when there is no `title`), `footer`, `imageTop` (content before the header) and `className`.

# Text entries and infolists

```tsx
import { BooleanEntry, Infolist, TextEntry } from "@javaabu/forms"

<Infolist title="User" model={user}>
  <TextEntry name="name" label="ނަން" />
  <TextEntry name="bio" multiline />
  <TextEntry name="role" />      {/* an enum { value, label, color } shows a status badge */}
  <BooleanEntry name="active" /> {/* Yes / No, or "-" when null */}
</Infolist>
```

Values are formatted like Blade's `FormatsValues`: booleans become Yes / No and empty values "-". An enum serialized as `{ value, label }` shows its label, or a status badge when it has a `color`. Arrays become lists. `wysiwyg` renders the value as HTML; only use it for trusted, sanitized HTML. Children replace the value.

| Prop | Description |
| --- | --- |
| `name` | Attribute to read from the bound model. Also generates the label. |
| `label`, `showLabel` | The label, and `false` to hide it. |
| `value` | The value to show instead of the bound one. |
| `model` | Binding target, as for fields. |
| `inline` | Label beside the value. |
| `multiline` | Keep line breaks. |
| `wysiwyg` | Render trusted HTML. |
| `inlineEntryLabelClass`, `inlineEntryClass` | Classes for the label and value. |

`Infolist` is a `Card` that binds `model` for its entries; `layout` (`auto`, `stacked`, `inline`) sets every entry's layout. `FormattedValue` formats a value on its own: `<FormattedValue value={user.role} />`.

# Accordion

```tsx
import { Accordion, AccordionItem } from "@javaabu/forms"

<Accordion
  id="application-faq"
  items={{
    applicationRequirements: { title: "What do I need to apply?", content: "Have your documents ready.", show: true },
    applicationStatus: { title: "How do I check my status?" },
  }}
  slots={{ applicationStatus: <p>Sign in and open <a href="/applications">Applications</a>.</p> }}
>
  <AccordionItem name="extra" title="Anything else?">
    Contact us.
  </AccordionItem>
</Accordion>
```

`items` is an object keyed by panel name, or a list. `slots` are Blade's named slots: `applicationStatus` (or `application-status`) for a panel's body, `applicationStatusHeader` for its header, and `item-0` for list items. Panel ids follow Blade: the key for named items, `<id>-item-<n>-collapse` for list items. `show` opens a panel; with several open, more than one can be open at a time. `AccordionItem` takes `name`, `title`, `header`, `content` or children, `show`, `disabled` and `id`.

Fields inside a closed item keep their values and are submitted, and an item opens when a field inside has an error. That holds with the HTML and shadcn adapters. With the Onu adapter, closed items are unmounted until [Javaabu/onu#60](https://github.com/Javaabu/onu/issues/60) lands, so put fields in `Tabs` or a fieldset instead.

# Tabs and NavTabs

```tsx
import { NavTabs, Tabs, TabsPane } from "@javaabu/forms"

<Tabs tabs={[{ name: "home" }, { name: "profile", title: "ޕްރޮފައިލް" }, { name: "contact", disabled: true }]} active="profile">
  <TabsPane name="home">…</TabsPane>
  <TabsPane name="profile">…</TabsPane>
</Tabs>

<NavTabs tabs={[{ title: "Details", url: "/users/1/edit", active: true }, { title: "Roles", url: "/users/1/roles" }]} />
```

Every pane stays mounted, so a form split across tabs submits all its fields, as in Blade, and the tab with the first invalid field opens when errors arrive.

`Tabs` takes `tabs` (`name`, `title`, `disabled`, `url`, `content`), `active` (default: the first), `slots` (pane content by slot name) and `onValueChange`. A tab with `url` navigates to it. When a field with errors is in a hidden tab, the tab opens so the field can take focus (HTML adapter). `NavTabs` are tabs that are links to pages (`title`, `url`, `active`, `disabled`, `icon`).

# Modal

```tsx
import { Button, Modal } from "@javaabu/forms"

<Modal title="Edit user" modalSizeClass="modal-xl" trigger={<Button>Edit</Button>}>
  …
</Modal>
```

Open it with `trigger`, or control it with `open` and `onOpenChange` (`defaultOpen` for an uncontrolled start). `modalSizeClass` takes Bootstrap's size classes (`modal-sm`, `modal-lg`, `modal-xl`, `modal-fullscreen`; default `modal-lg`), or pass `size` (`sm`, `md`, `lg`, `xl`, `full`). It also takes `description`, `footer` and `id`.

# Status

```tsx
<Status color="success" label="Published" />
<Status color="danger">ބާތިލް</Status>
```

`color` is a Bootstrap colour (default `primary`), mapped to a tone: `success`, `danger`, `warning`, `info` (`info` and `primary`), or neutral.

# Conditional link

```tsx
import { ConditionalLink } from "@javaabu/forms"

<ConditionalLink url={`/organizations/${org.id}/users`} can="view" arg="users" name="users_count" model={org} />
```

It links when `showLink` is true. Without `showLink`, it links when `FormsProvider authorize(can, arg, guard)` allows it, and shows plain text otherwise. The text is `children`, `value`, or the bound value of `name`.

# How it renders

The HTML adapter renders plain elements: `<details>` for accordions, a tab list with ARIA roles, a `<dialog>` for modals, and a `<dl>` for entries. The Onu adapter uses Onu's `Callout`, `Card`, `Accordion`, `Tabs`, `NavTabs`, `Modal`, `StatusBadge` and `DescriptionList`. The shadcn adapter uses your `Alert`, `Card`, `Accordion`, `Tabs`, `Dialog` and `Badge`, and plain HTML for the rest.

# Accessibility

Tabs use the `tablist` / `tab` / `tabpanel` roles. Modals are labelled by their title, and Onu's and shadcn's dialogs trap focus and return it when they close.
