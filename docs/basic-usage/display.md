---
title: Display components
sidebar_position: 10
---

## Alert

```tsx
<Forms.Alert type="success" heading="Application submitted" dismissible>
  We have received your application.
</Forms.Alert>
```

`type`: `primary`/`info`, `success`, `warning`, `danger`. `icon` takes a semantic icon name or CSS classes.

## Card and Infolist

```tsx
<Forms.Card title="Details" subtitle="Last updated today" footer={<Forms.Submit>Save</Forms.Submit>}>…</Forms.Card>

<Forms.Infolist title="User" model={user}>
  <Forms.TextEntry name="name" />
  <Forms.TextEntry name="bio" multiline />
  <Forms.BooleanEntry name="active" />
</Forms.Infolist>
```

`TextEntry` formats values like `FormatsValues`: booleans become Yes / No and empty values "-". An enum `{ value, label, color? }` shows its label, or a status badge when it has a colour. Arrays become lists. `wysiwyg` renders trusted HTML. Children replace the value.

## Accordion

```tsx
<Forms.Accordion
  id="application-faq"
  items={{
    applicationRequirements: { title: "What do I need to apply?", content: "Have your documents ready.", show: true },
    applicationStatus: { title: "How do I check my status?" },
  }}
  slots={{ applicationStatus: <p>Sign in and open <a href="/applications">Applications</a>.</p> }}
>
  <Forms.AccordionItem name="extra" title="Anything else?">Contact us.</Forms.AccordionItem>
</Forms.Accordion>
```

Panel ids follow Blade: the key for named items, `<id>-item-<n>-collapse` for list items.

## Tabs and NavTabs

```tsx
<Forms.Tabs tabs={[{ name: "home" }, { name: "profile", title: "Profile" }, { name: "contact", disabled: true }]} active="profile">
  <Forms.TabsPane name="home">…</Forms.TabsPane>
  <Forms.TabsPane name="profile">…</Forms.TabsPane>
</Forms.Tabs>

<Forms.NavTabs tabs={[{ title: "Details", url: "/users/1/edit", active: true, icon: "user" }]} />
```

## Modal, Status, ConditionalLink

```tsx
<Forms.Modal title="Edit user" modalSizeClass="modal-xl" trigger={<Forms.Button>Edit</Forms.Button>}>…</Forms.Modal>
<Forms.Status color="success" label="Published" />
<Forms.ConditionalLink url={`/organizations/${org.id}/users`} can="view" arg="users" name="users_count" model={org} />
```

`ConditionalLink` links when `showLink` is true. Otherwise it links when `FormsProvider authorize(can, arg, guard)` allows it, and shows plain text when it doesn't.

## Accessibility

These are Onu components: the accordion and tabs follow the WAI-ARIA patterns, and the modal traps focus and returns it when it closes.
