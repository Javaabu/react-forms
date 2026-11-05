---
"@javaabu/forms": patch
---

Tab panels stay mounted in every adapter (and accordion items in the HTML and shadcn adapters), so fields in other tabs keep their values and submit, as in Blade. The tab or item with an invalid field opens when errors arrive. New for adapters: `TabPanel` and `useReveal`. `Textarea wysiwyg` passes `className` and `onChange` on. The docs are rewritten for the adapter-based API, with `llms.txt`, an API reference, an upgrade guide from `@javaabu/react-forms`, and a Laravel Boost guideline and skill (`javaabu-react-forms`).
