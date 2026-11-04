---
"@javaabu/forms": minor
---

New `@javaabu/forms/inertia`. `<FormsProvider router={inertia}>` submits every form as an Inertia visit, with files, method spoofing, error bags, progress, `preserveScroll` / `preserveState` (default `"errors"`) and `resetOnSuccess`. Errors and old input come from the page props. `<Form form={useForm(…)}>` binds the fields to `useForm` data, nested names and checkbox groups included. `inertiaLinks` puts Inertia's `Link` in the `Link` slot. Without Inertia, `fetchRouter` submits JSON requests and shows 422 errors. `@inertiajs/react` (v2 or v3) is an optional peer dependency.
