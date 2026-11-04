---
"@javaabu/forms": minor
---

The core no longer depends on Onu. Components render through an adapter: `<FormsProvider ui={onu}>` with `onu` from `@javaabu/forms/onu`, and `components={{ Select: MySelect }}` replaces single components for the whole app or one form. Without an adapter, components render plain HTML (`@javaabu/forms/html`). `Wysiwyg` and `MapInput` are now in the main entry. Onu's editor and maps come from `@javaabu/forms/onu/editor` and `/onu/maps`, combined with `mergeAdapters(onu, onuEditor, onuMaps)`. The `./editor` and `./maps` entries are gone. Onu is now an optional peer dependency (`^0.2.1`).
