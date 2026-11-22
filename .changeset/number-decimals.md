---
"@javaabu/forms": patch
---

`Number`, `Latitude` and `Longitude` with `decimals` now submit the rounded value they report: the HTML and shadcn adapters show it once the input loses focus, and the Onu adapter rounds what it reports. The conformance kit checks it.
