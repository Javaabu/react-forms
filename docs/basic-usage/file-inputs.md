---
title: File Inputs and Image Inputs
sidebar_position: 7
---

```blade
<x-forms::form :model="$article" files>
    <x-forms::file name="attachment" type="document" />
    <x-forms::image name="featured_image" conversion="preview" width="500" height="500" />
</x-forms::form>
```

```tsx
import { File, Form, Image, Submit } from "@javaabu/forms"

export function ArticleFiles({ article }) {
  return (
    <Form model={article} action={`/articles/${article.id}`} method="PATCH" files>
      <File name="attachment" type="document" label="ލިޔުން" />
      <Image name="featured_image" conversion="preview" width={500} height={500} />
      <Submit />
    </Form>
  )
}
```

Give the form `files` so it is sent as `multipart/form-data`.

# The current file

The current file comes from the bound attribute: a URL, or a spatie/laravel-medialibrary `Media` object as JSON. Otherwise it comes from the model's `media` array, matched by `collection_name` (default: the field's `name`). `conversion` links to `media.conversions[conversion]`, or `preview_url` for `preview`. `ignoreAccessor` skips the attribute and reads only from `media`.

`File` shows the current file as a download link. `Image` shows it as the preview.

# Allowed types and the hint

The hint ("Only .pdf, .jpeg and .png files of max 10 MB allowed.") comes from a port of javaabu/helpers' `AllowedMimeTypes` and the `max_upload_file_size` / `max_image_file_size` settings (in KB, set with `FormsProvider settings`). Register your own types:

```ts
import { registerMimeTypes } from "@javaabu/forms"

registerMimeTypes("paper", ["application/pdf", "application/msword"])
```

# File props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `string \| string[]` | `document` (`image` for `Image`) | `AllowedMimeTypes` type(s). |
| `mimetypes` | `string \| string[]` | from `type` | The `accept` list. |
| `extensions` | `string \| string[]` | from the mime types | Shown in the hint. |
| `maxSize` | `number` (KB) | from settings | Shown in the hint and passed to the adapter. |
| `multiple` | `boolean` | `false` | Allow several files (`File`). |
| `collection` | `string` | `name` | Media collection. |
| `conversion` | `string` | | Media conversion to link to. |
| `showHint` | `boolean` | `true` | Show the hint. A `help` prop replaces it. |
| `ignoreAccessor` | `boolean` | `false` | Read only from `media`. |
| `fileInputClass` | `string` | | Classes for the file input (`File`). |
| `upload` | `boolean` | `false` | Upload as soon as a file is picked (see below). |
| `onUploaded` | `(response) => void` | reload the page | After an upload or removal. |
| `onChange` | `(files: File[]) => void` | | The picked files (`File`). |
| `className` | `string` | | |

# Image props

`Image` takes the file props above (except `multiple` and `fileInputClass`), plus:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width`, `height` | `number` | `400` | Recommended size, shown in the hint. |
| `circle` | `boolean` | `false` | Round preview (ratio 1). |
| `cover` | `boolean` | `false` | The image covers the preview. |
| `fullwidth` | `boolean` | `false` | The preview takes the full width. |
| `aspectRatio` | `number` | `height / width` | Blade's ratio: height ÷ width. |
| `maintainAspectRatio` | `boolean` | `true` | `false` shows a square preview. |
| `icon` | `ReactNode` | "Click to select an image" | Content of the empty preview. |
| `onChange` | `(file: File \| null) => void` | | |

# Uploading straight away

`FileUpload` and `ImageUpload` (or `upload`) work like js-utilities' `fileUploadInput`. They post the file to the surrounding form's `action`, with its `_method` and `_token`. Then they reload the page, or call `onUploaded`. The file input itself has no name, so it isn't sent again with the form.

```tsx
import { router } from "@inertiajs/react"
import { Form, ImageUpload } from "@javaabu/forms"

export function Avatar({ user }) {
  return (
    <Form model={user} action={`/users/${user.id}/avatar`} method="PATCH" files>
      <ImageUpload name="avatar" circle onUploaded={() => router.reload({ only: ["user"] })} />
    </Form>
  )
}
```

Removing an uploaded file asks for confirmation, then posts an empty value. A 422 response shows its errors on the form; other failures show a notification. The adapter provides the confirmation dialog and the notification (the HTML adapter uses `window.confirm` and `alert`).

# How it renders

The HTML adapter renders a native `<input type="file">`; for images, a preview with a remove button. The Onu adapter uses Onu's `FileInput` (drag and drop, paste) and `ImageInput`. The shadcn adapter renders a file `Input`, and the HTML image input.

# Accessibility

The file input is a native `<input type="file">` in every adapter, so it works with the keyboard. The image preview uses the label as its alt text.
