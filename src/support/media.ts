import { dataGet, isNil } from "./data"

/**
 * A file value as Laravel sends it: a URL, or a spatie/laravel-medialibrary
 * `Media` model serialized to JSON (`original_url`, `preview_url`, `file_name`,
 * `collection_name`). `conversions` (a name → URL map) is used for `conversion`
 * when your API resource adds it.
 */
export interface MediaLike {
  original_url?: string
  preview_url?: string
  url?: string
  file_name?: string
  name?: string
  collection_name?: string
  conversions?: Record<string, string>
}

export interface ResolvedFile {
  url: string
  fileName: string
}

function basename(url: string) {
  try {
    const path = new URL(url, "http://localhost").pathname
    return decodeURIComponent(path.split("/").filter(Boolean).pop() ?? "")
  } catch {
    return url.split("/").pop() ?? ""
  }
}

/** `getFileUrl`: the URL of a media value, using `conversion` when it was generated. */
export function mediaUrl(media: unknown, conversion = ""): ResolvedFile | null {
  if (isNil(media) || media === "") return null
  if (typeof media === "string") return { url: media, fileName: basename(media) }
  if (typeof media !== "object") return null
  const m = media as MediaLike
  const converted = conversion
    ? (m.conversions?.[conversion] ?? (conversion === "preview" ? m.preview_url : undefined))
    : undefined
  const url = converted || m.original_url || m.url
  if (!url) return null
  return { url, fileName: m.file_name ?? basename(url) }
}

/**
 * `HandlesMediaValues::getBoundValue`: the bound attribute (unless `ignoreAccessor`),
 * else the first item of `media` in `collection` on the model.
 */
export function resolveBoundMedia(target: unknown, path: string, collection: string, ignoreAccessor: boolean): unknown {
  if (isNil(target)) return undefined
  const bound = ignoreAccessor ? undefined : dataGet(target, path)
  if (!isNil(bound) && bound !== "") return bound
  const media = dataGet(target, "media")
  if (Array.isArray(media)) return media.find((m) => (m as MediaLike)?.collection_name === collection)
  return undefined
}
