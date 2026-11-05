---
"@javaabu/forms": minor
---

New `@javaabu/forms/testing`: `testAdapter(myAdapter)` runs conformance tests that render every component through an adapter and check labels, values, native submission, errors and ARIA. The adapter contract is typed (`defineAdapter`, `FormsComponents` and a `…SlotProps` type per slot) and documented in `docs/advanced-usage/adapters.md`. `@testing-library/react` is an optional peer dependency.
