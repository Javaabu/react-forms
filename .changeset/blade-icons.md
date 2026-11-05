---
"@javaabu/forms": minor
---

Icons match javaabu/forms (Blade): `startIcon`, `endIcon` and the new `Icon` component take Blade's 30 bundled Lucide names (`pencil`, `trash-2`, `eye`, `check`, …) or icon font classes. The Onu adapter maps them to Onu's icon names. `close` and `error` stay as aliases of `x` and `circle-alert`. Adds `BUNDLED_ICONS`, `ICON_ALIASES` and `resolveIconName()` for adapters.
