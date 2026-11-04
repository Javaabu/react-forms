---
title: Translations
sidebar_position: 11
---

Every string the components show comes from [`@javaabu/i18n`](https://github.com/Javaabu/i18n), under the same keys as the Blade package: `forms::strings.nothing_selected`. The package ships English and Dhivehi lines, and components re-render when the locale changes.

# The locale

`@javaabu/i18n` reads the locale from `<html lang>`. Laravel's default layout already sets it:

```blade
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() === 'dv' ? 'rtl' : 'ltr' }}">
```

For a language switcher, call `setLocale()`:

```tsx
import { setLocale } from "@javaabu/i18n"

<Forms.Button color="light" onClick={() => setLocale("dv")}>ދިވެހި</Forms.Button>
```

If you use the Onu adapter, Onu's own strings (date pickers, the file input) follow `OnuProvider locale`. Keep it in step with the page:

```tsx
import { useTranslation } from "@javaabu/i18n/react"
import { OnuProvider } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

function Providers({ children }) {
  const { locale } = useTranslation()
  return <OnuProvider locale={locale.startsWith("dv") ? dv : undefined}>{children}</OnuProvider>
}
```

# Changing the package's lines

The package looks up each line in this order:

1. a line your app loaded for the current locale,
2. the bundled line for the current locale (`en` or `dv`),
3. your app's line for the fallback locale,
4. the bundled English line.

So you change a line the same way you would for the Blade components: in `lang/vendor/forms/{locale}/strings.php`.

```php
<?php

// lang/vendor/forms/dv/strings.php

return [
    'nothing_selected' => 'ހޮވާފައެއް ނެތް',
];
```

Then send your app's translations to the browser, as you do for your own lines. With [javaabu/js-localization](https://github.com/Javaabu/js-localization) or Laravel JS Localization, vendor lines arrive with their `forms::` namespace and `@javaabu/i18n` reads them. You can also add lines in JavaScript:

```ts
import { addLines } from "@javaabu/i18n"

addLines({ "strings.nothing_selected": "ހޮވާފައެއް ނެތް" }, "dv", "forms")
```

# Generated labels

A field without a `label` gets one from its name (`company_name` becomes "Company Name"), passed through `__()`, as Blade does with `trans()`. Translate it with a JSON line in `lang/dv.json`:

```json
{
  "Company Name": "ކުންފުނީގެ ނަން"
}
```

Or pass your own translator to `FormsProvider translate`:

```tsx
<FormsProvider translate={(text) => myTranslate(text)}>
```

# Using the strings in your components

```tsx
import { useFormsTranslation } from "@javaabu/forms"

function UploadHint() {
  const { t } = useFormsTranslation()
  return <p>{t("file_hint", { types: ".pdf", size: "2 MB" })}</p>
}
```

`useFormsTranslation()` also returns `translate` (the label translator), `locale` and `direction`.

# Every line

| Key | English | Dhivehi |
| --- | --- | --- |
| `required_text` | * | * |
| `nothing_selected` | Nothing Selected | އެއްވެސް އެއްޗެއް ޙިޔާރުނުކޮށް |
| `blank` | - | - |
| `yes` | Yes | އާނ |
| `no` | No | ނޫން |
| `table_array_separator` | ,  | ،  |
| `fileinput_select_file` | Select file | ފައިލް ސެލެކްޓްކޮށްލާ |
| `fileinput_upload_file` | Upload file | ފައިލް އަޕްލޯޑްކުރޭ |
| `fileinput_change_file` | Change | ބަދަލުކޮށްލާ |
| `fileinput_remove_file` | Remove | ފުހެލާ |
| `fileinput_nothing_selected` | No file selected. | އެއްވެސް ފައިލެއް ސެލްކްޓްނުކޮށް. |
| `imageinput_select_image` | Click to select an image | އިމޭޖެއް ސެލެކްޓްކުރަން ފިތާލާ |
| `latitude` | Latitude | ލެޓިޓިއުޑް |
| `longitude` | Longitude | ލޯންޖިޓިއުޑް |
| `radius` | Radius | ރޭޑިއަސް |
| `meters_abbr` | m | m |
| `km_abbr` | km | km |
| `boundary` | Boundary | ބައުންޑަރީ |
| `file_hint` | Only :types files of max :size allowed. | ހަމައެކަނި :types ވައްތަރުގެ :size އަށް ވުރެ ބޮޑު ނޫން ފައިލް. |
| `image_hint` | Recommended :widthpx x :heightpx. | ރަނގަޅުވާނީ :widthpx x :heightpx. |
| `text_list_separator` | ,  | ،  |
| `text_list_separator_last_glue` |  and  |  އަދި  |
| `map_search_string` | Search... | ހޯދާ... |
| `search_form_placeholder` | Search... | ހޯދާ... |
| `kb` | KB | KB |
| `mb` | MB | MB |
| `gb` | GB | GB |
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
| `pagination_previous` | Previous | ކުރީގެ |
| `pagination_next` | Next | ދެން |
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

The Dhivehi lines marked for review are listed in [Dhivehi and RTL](../advanced-usage/dhivehi-and-rtl).
