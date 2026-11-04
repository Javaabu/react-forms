---
title: Dhivehi and RTL
sidebar_position: 5
---

The components work in Dhivehi and other right-to-left languages with no extra setup.

# Direction

Set `dir` on `<html>` (Laravel's layout does, from the locale). Everything is laid out with logical properties (`margin-inline-start`, Tailwind's `ms-` / `pe-` / `start-`), so it mirrors on its own. Arrows that point to a side (pagination's previous and next) flip in right-to-left pages.

When the locale changes at runtime (`setLocale("dv")` from `@javaabu/i18n`), update `<html>` yourself and the components' strings follow:

```tsx
import { useTranslation } from "@javaabu/i18n/react"

function Direction() {
  const { locale, direction } = useTranslation()
  React.useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = direction
  }, [locale, direction])
  return null
}
```

# Typing Thaana

Give free-text fields `thaana` and people can type Thaana from a Latin keyboard (the common phonetic layout, from JTK). The field is marked `dir="rtl" lang="dv"`. `thaanaToggle` adds a button to switch between Thaana and Latin.

```tsx
<Text name="name_dv" label="ނަން" thaana />
<Textarea name="address_dv" label="އެޑްރެސް" thaana thaanaToggle />
```

`Email`, `Url`, `Tel`, `Password` and `Number` are always left-to-right and ignore `thaana`.

With the Onu adapter, Onu's own Thaana support does the typing. Other adapters use `thaanaKeyDown`, which you can also put on your own inputs:

```tsx
import { thaanaKeyDown, toThaana } from "@javaabu/forms"

<input onKeyDown={thaanaKeyDown} dir="rtl" lang="dv" />
toThaana("dhivehi") // "ދހިވެހި"
```

# Fonts

Load a Thaana font, for example `@fontsource-variable/noto-sans-thaana`, and put it in your font stack. Onu's theme includes one.

# Writing an adapter for RTL

- Use logical CSS only. This repository's lint rule rejects `ml-`, `pr-`, `left-`, `text-right` and the like.
- Flip icons that point to a side when `useFormsTranslation().direction === "rtl"`.
- Don't set `dir` on controls unless you were given it (`Input` and `Textarea` get `dir` and `lang` with `thaana`).

# Dhivehi lines to review

Every string has a Dhivehi line. The ones in javaabu/forms v1's `lang/dv/strings.php` were written by people. The rest were written while building this package and need a native speaker's review. Change them in `src/core/locales/dv.ts`, and in javaabu/forms' `lang/dv/strings.php` for shared keys. Apps can override any of them without waiting (see [Translations](../basic-usage/translations)).

| Key | English | Dhivehi |
| --- | --- | --- |
| `bulk_action` | Bulk Action | ބަލްކް އެކްޝަން |
| `apply` | Apply | ހިންގާ |
| `filter` | Filter | ފިލްޓަރ |
| `export` | Export | އެކްސްޕޯޓް |
| `clear` | Clear | ސާފުކުރޭ |
| `select_all` | Select All | ހުރިހާ އެއްޗެއް ޚިޔާރުކުރޭ |
| `select_row` | Select :name | :name ޚިޔާރުކުރޭ |
| `create_new` | Create New | އާ އެއްޗެއް ހަދާ |
| `no_items_title` | It's a bit lonely here. | މިތާ އަދި އެއްވެސް އެއްޗެއް ނެތް. |
| `no_items_message` | Let's create some new :model_type. | އައު :model_type ހަދާލަމާ. |
| `items` | items | އެއްޗެހި |
| `pagination` | Pagination | ޞަފްޙާތައް |
| `previous` | Previous | ކުރީގެ |
| `next` | Next | ދެން |
| `per_page` | Per page | ކޮންމެ ސަފްހާއެއްގައި |
| `export_title` | Export to XLSX | XLSX އަށް އެކްސްޕޯޓްކުރޭ |
| `export_options` | More export options | އިތުރު އެކްސްޕޯޓް އޮޕްޝަންތައް |
| `sort_by` | Sort by :label | :label އިން ތަރުތީބުކުރޭ |
| `loading` | Loading... | ލޯޑުވަނީ… |
| `error_loading_options` | Error Loading Options | އޮޕްޝަންތައް ލޯޑެއް ނުކުރެވުނު |
| `uploading` | Uploading... | އަޕްލޯޑްކުރަނީ… |
| `removing` | Removing... | ފޮހެލަނީ… |
| `are_you_sure` | Are you sure? | ކަށަވަރުތަ؟ |
| `remove_file_confirm` | You will not be able to undo deleting this file! | މި ފައިލް ފޮހެލުމަށްފަހު އަނބުރާ ނުގެނެވޭނެ! |
| `remove_file_confirm_button` | Yes, remove it! | އާން، ފޮހެލާ! |
| `cancel` | Cancel | ކެންސަލްކުރޭ |
| `upload_error` | An error occurred while uploading the file. | ފައިލް އަޕްލޯޑްކުރުމުގައި މައްސަލައެއް ދިމާވެއްޖެ. |
| `remove_error` | An error occurred while removing the file. | ފައިލް ފޮހެލުމުގައި މައްސަލައެއް ދިމާވެއްޖެ. |
| `file_too_large` | File size cannot be greater than :size MB | ފައިލްގެ ސައިޒު :size MB އަށްވުރެ ބޮޑުވެގެން ނުވާނެ |
| `file_type_not_allowed` | Only :accept files are allowed. | ހަމައެކަނި :accept ފައިލް. |
| `confirm_text` | Just checking if you wanted to really do this. | މިކަން ކުރަން ބޭނުންވާކަން ކަށަވަރުކޮށްލަން. |
| `confirm_button` | Yes, continue! | އާން، ކުރިއަށް! |
| `delete_confirm_text` | You will not be able to undo this delete operation! | މި ފޮހެލުމަށްފަހު އަނބުރާ ބަދަލެއް ނުކުރެވޭނެ! |
| `delete_confirm_button` | Yes, delete it! | އާން، ފޮހެލާ! |
| `error_summary_title` | Please correct the errors below. | ތިރީގައިވާ ގޯސްތައް ރަނގަޅުކުރައްވާ. |
| `submit_failed` | The form could not be submitted. Please try again. | ފޯމު ހުށައެޅިއެއް ނުދިޔައެވެ. އަލުން މަސައްކަތްކުރައްވާ. |
| `close` | Close | ބަންދުކުރޭ |
| `page` | Page :page | ސަފްހާ :page |
| `search` | Search | ހޯދާ |
| `add_option` | Add ":value" | ":value" އިތުރުކުރޭ |
| `thaana_toggle` | Type in Thaana | ތާނައިން ލިޔުއްވާ |
