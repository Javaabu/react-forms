---
title: Icons
sidebar_position: 9.6
---

Buttons (`startIcon`, `endIcon`) and the `Icon` component take the icon names javaabu/forms (Blade) bundles, so a page's buttons look the same in Blade and React.

```tsx
import { Icon, LinkButton, Submit } from "@javaabu/forms"

<LinkButton url={links.edit} color="secondary" size="sm" startIcon="pencil">
  ބަދަލުކުރޭ
</LinkButton>
<Submit color="danger" size="sm" startIcon="trash-2">
  ފޮހެލާ
</Submit>
<Icon name="circle-check" className="text-success" />
```

`Icon` is Blade's `<x-forms::icon>`. Icons are hidden from screen readers: give icon-only buttons an `aria-label`.

# Bundled icons

These [Lucide](https://lucide.dev) icons, the same set as Blade's `resources/icons/icons.php`:

`arrow-down`, `arrow-up`, `arrow-up-down`, `calendar`, `check`, `chevron-down`, `chevron-left`, `chevron-right`, `chevron-up`, `circle-alert`, `circle-check`, `circle-x`, `clock`, `download`, `ellipsis`, `external-link`, `eye`, `file`, `file-text`, `image`, `info`, `loader-circle`, `map-pin`, `pencil`, `plus`, `search`, `trash-2`, `triangle-alert`, `upload`, `x`.

React also has `chevrons-up-down`, and keeps two older names: `close` (`x`) and `error` (`circle-alert`).

# Icon fonts

Any other name is icon font classes, rendered as `<i class="…" aria-hidden="true">`, as in Blade:

```tsx
<Button startIcon="fa-solid fa-mosque">Mosques</Button>
```

# How each adapter draws them

| Adapter | Bundled names | Other names |
| --- | --- | --- |
| HTML, shadcn/ui | Inline Lucide SVGs, `currentColor`. `chevron-left` and `chevron-right` mirror in RTL. | `<i class>` |
| Onu | Onu's `Icon` by Onu's semantic name (`pencil` → `edit`, `trash-2` → `trash`, `x` → `close`, `circle-check` → `success`, `triangle-alert` → `warning`, `ellipsis` → `more`, `loader-circle` → `loading`, `arrow-up-down` → `sort`), so `OnuProvider icons` overrides apply. `circle-alert` and `circle-x`, which Onu doesn't name, draw the Lucide SVG. | Onu's `Icon` by that name (a name in `OnuProvider icons`), else `<i class>` |

Replace the `Icon` slot to draw icons another way: `<FormsProvider components={{ Icon: MyIcon }}>`. Buttons in the HTML and shadcn adapters draw their icons through the same slot.

# Differences from Blade

Blade's `icons` config (which icon the date picker, clear button, upload button, … use) has no React counterpart: those icons come from the adapter. See [Parity](../parity).
