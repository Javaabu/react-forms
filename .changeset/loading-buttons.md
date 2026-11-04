---
"@javaabu/forms": patch
---

Submit buttons of the HTML and shadcn adapters submit again with `animate`. While loading, they use `aria-disabled` and ignore clicks instead of `disabled`, because a button disabled during its own click doesn't submit the form. The shadcn adapter now styles `Form`, `DescriptionList`, `DescriptionItem` and `EmptyState`, and lays out `inline` fields side by side. New example pages for Inertia and fetch, with a mock Laravel endpoint.
