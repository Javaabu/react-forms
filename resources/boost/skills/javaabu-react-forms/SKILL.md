---
name: javaabu-react-forms
description: Build React forms, listing pages and record views with @javaabu/forms, the React version of the javaabu/forms Blade components, with model binding, old input, Laravel validation errors, Inertia and Wayfinder support, Dhivehi and RTL. Use whenever the project depends on @javaabu/forms and the task adds or changes a form, a field, a filter or table on a listing page, an Inertia page that submits data, or moves a Blade form (`<x-forms::…>`) to React.
license: MIT
metadata:
  author: Javaabu
---

# Building forms with @javaabu/forms

The components are javaabu/forms' Blade components in React. If you know `<x-forms::text name="title" required />`, you know `<Text name="title" required />`. The docs ship with the package: `node_modules/@javaabu/forms/llms.txt` lists every page in `node_modules/@javaabu/forms/docs/`.

## Setup is done once

The root of the app has a `FormsProvider` with the UI adapter, and, with Inertia, the router. Check it exists before adding forms. Don't add another in a page.

```tsx
import { FormsProvider, mergeAdapters } from "@javaabu/forms"
import { inertia, inertiaLinks } from "@javaabu/forms/inertia"
import { onu } from "@javaabu/forms/onu"

const ui = mergeAdapters(onu, inertiaLinks)

<FormsProvider ui={ui} router={inertia}>
  <App {...props} />
</FormsProvider>
```

## A typical create / edit page

```php
// app/Http/Controllers/ProductsController.php (Illuminate\Http\RedirectResponse, Inertia\Response)
public function edit(Product $product): Response
{
    $this->authorize('update', $product);

    return Inertia::render('products/edit', [
        'product' => $product->load('category', 'tags'),
        'categories' => Category::query()->pluck('name', 'id'),
        'tags' => Tag::query()->pluck('name', 'id'),
    ]);
}

public function update(ProductsRequest $request, Product $product): RedirectResponse
{
    $this->authorize('update', $product);

    $product->fill($request->validated());
    $product->category()->associate($request->input('category'));
    $product->save();

    if ($request->has('sync_tags')) {
        $product->tags()->sync($request->input('tags', []));
    }

    return to_route('products.edit', $product);
}
```

```tsx
import { __ } from "@javaabu/i18n"
import { Card, Checkbox, Form, Number, Select2, Submit, Text, Textarea } from "@javaabu/forms"
import { update } from "@/actions/App/Http/Controllers/ProductsController"

export default function Edit({ product, categories, tags }) {
  return (
    <Card title={__("Edit product")}>
      <Form model={product} action={update} files>
        <Text name="name" required />
        <Text name="name_dv" label={__("Name in Dhivehi")} thaana />
        <Textarea name="description" thaana />
        <Number name="price" decimals={2} prepend="MVR" />
        <Select2 name="category" options={categories} relation required />
        <Select2 name="tags" options={tags} relation multiple />
        <Checkbox name="is_published" />
        <Submit>{__("Save")}</Submit>
      </Form>
    </Card>
  )
}
```

What this gets you, with no extra code: values from `product`, ids and translated labels from the names, the `PUT` sent as `POST` with `_method`, `_token`, `sync_tags`, errors under each field from the Inertia response, the first invalid field focused, and a spinner on the submit button.

## Rules

- Use the Blade names: `Text`, `Email`, `Select2`, `FileUpload`, `TextEntry`, `Table`, … Blade attributes become camelCase props (`show-label` → `showLabel`), named slots become props (`help`, `prepend`, `append`), the default slot is `children`.
- Don't pass `id` or `label` that the name already gives. `company_name` → "Company Name" (translated with `__()`), `address[city]` → id `address-city`.
- Bind with `<Form model={…}>` or `<Model>`. Don't copy model values into `value` props. Precedence is old input → model → `default` (selects: old input → `default` → model).
- Name nested and array fields as in Blade: `address[city]`, `items[0][name]`, `channels[]` for checkbox groups. Multi-selects submit `name[]` and `sync_<name>`.
- Never render validation errors by hand, never add hidden `_method` / `_token` inputs, and never write `onSubmit` + `router.post` for an ordinary Inertia form. Use `errorBag` when the controller uses `validateWithBag`.
- `action` takes Wayfinder routes (`store()`), or the route function (`update`), which is called with the form's `model`. Without Wayfinder, a URL string.
- Use `useForm()` only when the page needs the data in code, and then pass it: `<Form form={form} action={store()}>`.
- Add `thaana` to free-text fields that take Dhivehi. Labels you write go through `__()` from `@javaabu/i18n`; add the Dhivehi line to `lang/dv.json`.
- Logical CSS only (`ms-`, `pe-`, `start-`, `text-start`).
- To change one component's look, replace its slot: `<FormsProvider components={{ Select: MySelect }}>`. Don't wrap or copy the component.

## Things that differ from what you might assume

- `summary` is off by default, as in Blade: errors show under their fields. Add `<Form summary>` for a list at the top.
- `Form` disables its fields while processing and focuses the first invalid field when errors arrive (`focusOnError={false}` turns that off).
- Radios are selected when the bound value equals their `value`. Checkboxes follow only old input once there is any (an unchecked box isn't submitted).
- `List` options (`["a", "b"]`) mean values `0` and `1`, as a PHP list. Use `{ a: "A" }` or `[[10, "Ten"]]` pairs for other values.
- Without an adapter the components render plain HTML. If the page looks unstyled, the `FormsProvider ui` is missing.

## References

- [Components and props](references/components.md): every component with its props and Blade counterpart
- [Listing pages](references/listing.md): tables, filters, bulk actions, pagination
- [Adapters](references/adapters.md): replacing slots, shadcn/ui, writing an adapter
