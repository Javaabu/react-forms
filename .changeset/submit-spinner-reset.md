---
"@javaabu/forms": patch
---

`Submit`'s spinner no longer sticks when a native submit doesn't leave the page: it stops on `pageshow` (back-forward cache) and when a handler prevented the submit.
