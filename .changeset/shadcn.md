---
"@javaabu/forms": minor
---

New `@javaabu/forms/shadcn`: `createShadcnAdapter({ Button, Input, Label, … })` makes an adapter from the app's own shadcn/ui components. Slots whose components are missing fall back to plain HTML. Searchable, multiple, tag and server-searched selects use the shadcn combobox (`Popover` + `Command`). Radios in a group now update together with any adapter, Radix's button radios included.
