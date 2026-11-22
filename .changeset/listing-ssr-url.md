---
"@javaabu/forms": minor
---

Listing components (sortable headings, `Filter`, `PerPage`, `SearchForm`, `BulkActions`, `Pagination`) no longer read `window.location` while rendering, so Inertia SSR pages hydrate without a mismatch. They read the URL from the router's new `useUrl()` hook (the Inertia router returns `usePage().url`) or the new `FormsProvider url`, else the browser's URL after hydration. `usePageUrl()` and `usePageQuery()` expose it.
