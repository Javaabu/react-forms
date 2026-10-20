"use client"

import * as React from "react"
import {
  Button,
  FileInput,
  Icon,
  ImageInput,
  confirm,
  readValidationErrors,
  toast,
  useOnuForm,
  type FileInputProps,
  type ImageInputProps,
} from "@javaabu/onu"

import { useBindTarget } from "../context/binding"
import { useCsrfToken, useFormsConfig, useFormsTranslation } from "../context/forms-provider"
import { usePublishField } from "../context/registry"
import { wrap } from "../support/data"
import { mediaUrl, resolveBoundMedia, type ResolvedFile } from "../support/media"
import { formatFileSize, getAllowedMimeTypes, getExtensions, getMaxFileSize } from "../support/mime-types"
import { bracketsToDots } from "../support/str"
import { submitFieldToForm } from "../support/upload"
import { FieldWrapper, splitFieldProps, useFieldNames, type FieldProps } from "./field"
import { useSyncedState } from "../support/use-synced-state"

export interface FileProps
  extends
    FieldProps,
    Omit<FileInputProps, "name" | "id" | "value" | "defaultValue" | "required" | "disabled" | "accept" | "maxSize"> {
  /** File type(s) from javaabu/helpers `AllowedMimeTypes` (`document`, `image`, `pdf`, …). Default `document`. */
  type?: string | string[]
  /** Allowed mime types. Default: those of `type`. */
  mimetypes?: string | string[]
  /** Extensions shown in the hint. Default: those of the mime types. */
  extensions?: string | string[]
  /** Max size in KB. Default: the `max_*_file_size` setting of `type`. */
  maxSize?: number
  /** Media collection to read from the model's `media`. Default: `name`. */
  collection?: string
  /** Media conversion to link to. */
  conversion?: string
  /** Classes for the file input. */
  fileInputClass?: string
  /** Show the "Only … files of max … allowed." hint. Default `true`. */
  showHint?: boolean
  /** Ignore the model attribute and read only from the model's `media`. */
  ignoreAccessor?: boolean
  /** Upload the file as soon as it is picked (see `FileUpload`). */
  upload?: boolean
  /** After an upload or removal succeeds. Default: reload the page, as in Blade. */
  onUploaded?: (response: unknown) => void
}

/** Accept list, extensions, max size and hint shared by `File` and `Image`. */
function useFileRules(props: Pick<FileProps, "type" | "mimetypes" | "extensions" | "maxSize">, fallbackType: string) {
  const { t } = useFormsTranslation()
  const { settings } = useFormsConfig()
  const types = wrap(props.type ?? fallbackType)
  const mimetypes = props.mimetypes ? wrap(props.mimetypes) : getAllowedMimeTypes(types)
  const extensions = props.extensions ? wrap(props.extensions) : getExtensions(mimetypes)
  const maxSize = props.maxSize ?? getMaxFileSize(types, settings)
  const list = extensions.map((e) => `.${e}`)
  const types_ =
    list.length > 1
      ? list.slice(0, -1).join(t("textListSeparator")) + t("textListSeparatorLastGlue") + list.at(-1)
      : (list[0] ?? "")
  const hint = t("fileHint", {
    types: types_,
    size: formatFileSize(maxSize, { kb: t("kb"), mb: t("mb"), gb: t("gb") }),
  })
  return { mimetypes, extensions, maxSize, hint, accept: mimetypes.join(",") || undefined }
}

/** The existing file of a field: the bound attribute, or the model's media in `collection`. */
function useExistingFile(
  props: Pick<FileProps, "name" | "model" | "default" | "collection" | "conversion" | "ignoreAccessor">,
) {
  const target = useBindTarget(props.model)
  const path = bracketsToDots(props.name)
  const bound = resolveBoundMedia(target, path, props.collection || props.name, !!props.ignoreAccessor)
  return mediaUrl(bound ?? props.default, props.conversion)
}

/** Uploads to (or clears the field on) the surrounding form's action, then reloads or calls `onUploaded`. */
function useFormUpload(name: string, onUploaded?: (response: unknown) => void) {
  const { t } = useFormsTranslation()
  const token = useCsrfToken()
  const form = useOnuForm()
  const anchor = React.useRef<HTMLSpanElement>(null)
  const [busy, setBusy] = React.useState<"uploading" | "removing" | null>(null)

  const send = async (value: File | string, mode: "uploading" | "removing") => {
    const owner = anchor.current?.closest("form")
    if (!owner || busy) return
    setBusy(mode)
    try {
      const response = await submitFieldToForm(owner, name, value, token)
      if (onUploaded) onUploaded(response)
      else window.location.reload()
    } catch (error) {
      const payload = await readValidationErrors(error)
      if (payload && form) form.setErrors(payload.errors, payload.message)
      else toast.error(payload?.message ?? (mode === "uploading" ? t("uploadError") : t("removeError")))
    } finally {
      setBusy(null)
    }
  }

  const remove = async () => {
    const ok = await confirm({
      title: t("areYouSure"),
      description: t("removeFileConfirm"),
      confirmLabel: t("removeFileConfirmButton"),
      cancelLabel: t("cancel"),
      variant: "destructive",
    })
    if (ok) await send("", "removing")
  }

  return { anchor, busy, upload: (file: File) => send(file, "uploading"), remove }
}

function ExistingFile({ file }: { file: ResolvedFile }) {
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      title={file.url}
      className="gap-2 text-sm inline-flex max-w-full items-center text-primary underline-offset-4 hover:underline"
    >
      <Icon name="download" size="sm" className="shrink-0" />
      <bdi className="truncate">{file.fileName || file.url}</bdi>
    </a>
  )
}

/**
 * `<x-forms::file>`: a file input that links to the current file (a URL or a
 * medialibrary `Media`) and shows the allowed types and size.
 */
function FileComponent(props: FileProps) {
  const { field, rest } = splitFieldProps(props)
  const {
    type,
    mimetypes: mimetypesProp,
    extensions: extensionsProp,
    maxSize: maxSizeProp,
    collection,
    conversion,
    fileInputClass,
    showHint = true,
    ignoreAccessor,
    upload,
    onUploaded,
    className,
    onChange,
    ...inputProps
  } = rest
  const { t } = useFormsTranslation()
  const names = useFieldNames(field)
  const rules = useFileRules(
    { type, mimetypes: mimetypesProp, extensions: extensionsProp, maxSize: maxSizeProp },
    "document",
  )
  const existing = useExistingFile({ ...field, collection, conversion, ignoreAccessor })
  const { anchor, busy, upload: uploadFile, remove: removeFile } = useFormUpload(field.name, onUploaded)
  const [picked, setPicked] = React.useState(false)

  usePublishField({
    id: names.id,
    name: field.name,
    kind: "value",
    value: picked ? "file" : (existing?.url ?? ""),
    disabled: field.disabled,
  })

  const help = field.help ?? (showHint ? rules.hint : undefined)

  return (
    <FieldWrapper {...field} id={names.id} label={names.label} help={help}>
      <span ref={anchor} className="gap-2 flex flex-col">
        {existing ? <ExistingFile file={existing} /> : null}
        <span className="gap-2 flex items-start">
          <FileInput
            {...inputProps}
            id={names.id}
            // An uploading input posts on its own, so it must not be part of the form's submit.
            name={upload ? "" : field.name}
            accept={rules.accept}
            maxSize={rules.maxSize ? rules.maxSize * 1024 : undefined}
            required={field.required || undefined}
            disabled={field.disabled || !!busy || undefined}
            showList={!upload}
            buttonLabel={
              upload ? t("fileinputUploadFile") : existing ? t("fileinputChangeFile") : t("fileinputSelectFile")
            }
            placeholder={busy ? t(busy) : t("fileinputNothingSelected")}
            className={[fileInputClass, className].filter(Boolean).join(" ") || undefined}
            onChange={(files) => {
              setPicked(files.length > 0)
              onChange?.(files)
              if (upload && files[0]) void uploadFile(files[0])
            }}
          />
          {upload && existing && !field.disabled ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t("fileinputRemoveFile")}
              loading={busy === "removing"}
              onClick={() => void removeFile()}
            >
              <Icon name="close" />
            </Button>
          ) : null}
        </span>
      </span>
    </FieldWrapper>
  )
}

/** `<x-forms::file-upload>`: a `File` that uploads as soon as a file is picked, to the form's action. */
export function FileUpload(props: Omit<FileProps, "upload">) {
  return <FileComponent {...props} upload />
}

type FileRuleProps = Pick<
  FileProps,
  | "type"
  | "mimetypes"
  | "extensions"
  | "maxSize"
  | "collection"
  | "conversion"
  | "showHint"
  | "ignoreAccessor"
  | "upload"
  | "onUploaded"
>

export interface ImageProps
  extends
    FieldProps,
    FileRuleProps,
    Omit<
      ImageInputProps,
      | "name"
      | "id"
      | "value"
      | "defaultValue"
      | "required"
      | "disabled"
      | "accept"
      | "maxSize"
      | "alt"
      | "placeholder"
      | "aspectRatio"
    > {
  /** Recommended width in px, shown in the hint. Default `400`. */
  width?: number
  /** Recommended height in px, shown in the hint. Default `400`. */
  height?: number
  /** Show the preview as a circle. */
  circle?: boolean
  /** Let the image cover the preview area. */
  cover?: boolean
  /** Let the preview take the full width. */
  fullwidth?: boolean
  /** Preview aspect ratio as height ÷ width (Blade). Default `height / width`. */
  aspectRatio?: number
  /** Keep the aspect ratio. Default `true`; `false` shows a square preview. */
  maintainAspectRatio?: boolean
  /** Content of the empty preview. Default: "Click to select an image". */
  icon?: React.ReactNode
}

/** `<x-forms::image>`: an image input with a preview of the current image. */
function ImageComponent(props: ImageProps) {
  const { field, rest } = splitFieldProps(props)
  const {
    type,
    mimetypes: mimetypesProp,
    extensions: extensionsProp,
    maxSize: maxSizeProp,
    collection,
    conversion,
    showHint = true,
    ignoreAccessor,
    upload,
    onUploaded,
    width = 400,
    height = 400,
    circle,
    cover,
    fullwidth,
    aspectRatio,
    maintainAspectRatio = true,
    icon,
    className,
    onChange,
    ...inputProps
  } = rest
  const { t } = useFormsTranslation()
  const names = useFieldNames(field)
  const rules = useFileRules(
    { type, mimetypes: mimetypesProp, extensions: extensionsProp, maxSize: maxSizeProp },
    "image",
  )
  const existing = useExistingFile({ ...field, collection, conversion, ignoreAccessor })
  const { anchor, busy, upload: uploadFile, remove: removeFile } = useFormUpload(field.name, onUploaded)
  const [value, setValue] = useSyncedState<File | string | null>(existing?.url ?? null)

  usePublishField({
    id: names.id,
    name: field.name,
    kind: "value",
    value: value ? "image" : "",
    disabled: field.disabled,
  })

  // Blade's ratio is height ÷ width (a padding percentage); Onu's is width ÷ height.
  const bladeRatio = circle ? 1 : (aspectRatio ?? (width ? height / width : 1))
  const ratio = maintainAspectRatio && bladeRatio ? 1 / bladeRatio : 1
  const help =
    field.help ??
    (showHint ? (
      <>
        {t("imageHint", { width, height })}
        <br />
        {rules.hint}
      </>
    ) : undefined)

  return (
    <FieldWrapper {...field} id={names.id} label={names.label} help={help}>
      <span ref={anchor} className="contents">
        <ImageInput
          {...inputProps}
          id={names.id}
          name={upload ? "" : field.name}
          alt={names.labelText}
          accept={rules.accept}
          maxSize={rules.maxSize ? rules.maxSize * 1024 : undefined}
          required={field.required || undefined}
          disabled={field.disabled || !!busy || undefined}
          shape={circle ? "circle" : undefined}
          aspectRatio={ratio}
          placeholder={icon ?? t("imageinputSelectImage")}
          className={[fullwidth ? "max-w-none" : undefined, className].filter(Boolean).join(" ") || undefined}
          classNames={cover || circle ? { image: "object-cover" } : undefined}
          value={value}
          onChange={(file) => {
            onChange?.(file)
            if (!upload) {
              setValue(file)
              return
            }
            if (file) {
              setValue(file)
              void uploadFile(file)
            } else if (existing) {
              void removeFile()
            } else {
              setValue(null)
            }
          }}
        />
      </span>
    </FieldWrapper>
  )
}

/** `<x-forms::image-upload>`: an `Image` that uploads as soon as an image is picked. */
export function ImageUpload(props: Omit<ImageProps, "upload">) {
  return <ImageComponent {...props} upload />
}

// Exported as `File` and `Image`; named differently here so the DOM globals stay usable.
export { FileComponent as File, ImageComponent as Image }
