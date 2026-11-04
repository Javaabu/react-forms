---
"@javaabu/forms": minor
---

Strings now come from `@javaabu/i18n` under the Blade package's keys (`forms::strings.nothing_selected`), so apps change them in `lang/vendor/forms/{locale}/strings.php` as they do for the Blade components. Generated labels go through `__()` by default. The locale follows `@javaabu/i18n` (`<html lang>`, `setLocale()`) instead of Onu's. `FormsProvider messages` is gone, and the string keys are now snake_case like Blade's (`t("nothing_selected")`).
