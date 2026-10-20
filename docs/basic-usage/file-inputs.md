---
title: File Inputs and Image Inputs
sidebar_position: 7
---

```tsx
<Forms.Form model={article} files>
  <Forms.File name="attachment" type="document" />
  <Forms.Image name="featured_image" conversion="preview" width={500} height={500} />
</Forms.Form>
```

The current file comes from the bound attribute (a URL or a medialibrary `Media` object). Otherwise it comes from the model's `media` array, matched by `collection_name` (default: the `name`). `conversion` uses `media.conversions[name]`, or `preview_url` for `preview`.

The hint ("Only .pdf, .jpeg and .png files of max 10MB allowed.") comes from a port of javaabu/helpers `AllowedMimeTypes` and the `max_*_file_size` settings. Register your own types with `registerMimeTypes("paper", […])`.

## File options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `string \| string[]` | `document` (`image` for images) | `AllowedMimeTypes` type(s). |
| `mimetypes` | `string \| string[]` | from `type` | `accept`. |
| `extensions` | `string \| string[]` | from the mime types | Shown in the hint. |
| `maxSize` | `number` (KB) | from settings | Also enforced when picking. |
| `collection` | `string` | `name` | Media collection. |
| `conversion` | `string` | | Media conversion to link to. |
| `showHint` | `boolean` | `true` | A `help` prop replaces the hint. |
| `ignoreAccessor` | `boolean` | `false` | Only read from `media`. |
| `upload` | `boolean` | `false` | Upload as soon as a file is picked. |
| `onUploaded` | `(response) => void` | reload | After an upload or removal. |

## Image options

| Prop | Default | Description |
| --- | --- | --- |
| `width` / `height` | `400` | Recommended size, shown in the hint. |
| `circle` | `false` | Round preview (ratio 1). |
| `cover` | `false` | Image covers the preview. |
| `fullwidth` | `false` | Preview takes the full width. |
| `aspectRatio` | `height / width` | Blade's ratio (height ÷ width). |
| `maintainAspectRatio` | `true` | `false` shows a square preview. |
| `icon` | | Content of the empty preview. |

## Uploading straight away

`FileUpload` and `ImageUpload` (or `upload`) work like js-utilities' `fileUploadInput`. They post the file to the surrounding form's `action`, with its `_method` and `_token`, then reload the page (or call `onUploaded`). Removing a file asks for confirmation, then posts an empty value. A 422 shows its errors on the form.

## Accessibility

The file input is a native `<input type="file">` styled by Onu, so it works with the keyboard and with drag and drop. The image preview uses the label as its alt text.
