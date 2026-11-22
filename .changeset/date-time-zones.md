---
"@javaabu/forms": patch
---

Date fields no longer move zone-aware values (Laravel's JSON for date casts, `2024-05-01T00:00:00.000000Z`) into the browser's time zone. `Date` keeps the date as written, and the new `app_timezone` setting (`FormsProvider settings`) shows every date field in the app's time zone.
