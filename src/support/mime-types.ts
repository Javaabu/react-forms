/**
 * Port of javaabu/helpers `AllowedMimeTypes` and `format_file_size`, which the
 * Blade file inputs use for `accept` and the "Only … files of max … allowed." hint.
 * The tables are copied from the PHP source.
 */

/** Allowed mime types per file type (`document`, `image`, …). Extend with `registerMimeTypes`. */
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/tiff",
    "image/x-citrix-png",
    "image/x-png",
    "image/svg+xml",
    "image/svg",
  ],
  icon: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/tiff",
    "image/x-citrix-png",
    "image/x-png",
    "image/x-icon",
    "image/vnd.microsoft.icon",
  ],
  video: ["video/webm", "video/ogg", "video/mp4"],
  audio: ["audio/mp3", "audio/wav"],
  excel: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
    "application/vnd.ms-excel.sheet.macroEnabled.12",
    "application/vnd.ms-excel.template.macroEnabled.12",
    "application/vnd.ms-excel.addin.macroEnabled.12",
    "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
    "text/csv",
  ],
  word: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "application/vnd.ms-word.document.macroEnabled.12",
    "application/vnd.ms-word.template.macroEnabled.12",
  ],
  powerpoint: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.template",
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    "application/vnd.ms-powerpoint.addin.macroEnabled.12",
    "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
    "application/vnd.ms-powerpoint.template.macroEnabled.12",
    "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
  ],
  pdf: ["application/pdf"],
  text: ["text/plain"],
  json: ["application/json"],
  document: ["application/pdf", "image/jpeg", "image/png"],
  zip: ["application/zip", "application/octet-stream", "application/x-zip-compressed", "multipart/x-zip"],
}

/** Extension per mime type. Extend with `registerMimeTypeExtensions`. */
export const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  "video/3gpp2": "3g2",
  "video/3gp": "3gp",
  "video/3gpp": "3gp",
  "application/x-compressed": "7zip",
  "audio/x-acc": "aac",
  "audio/ac3": "ac3",
  "application/postscript": "ai",
  "audio/x-aiff": "aif",
  "audio/aiff": "aif",
  "audio/x-au": "au",
  "video/x-msvideo": "avi",
  "video/msvideo": "avi",
  "video/avi": "avi",
  "application/x-troff-msvideo": "avi",
  "application/macbinary": "bin",
  "application/mac-binary": "bin",
  "application/x-binary": "bin",
  "application/x-macbinary": "bin",
  "image/bmp": "bmp",
  "image/x-bmp": "bmp",
  "image/x-bitmap": "bmp",
  "image/x-xbitmap": "bmp",
  "image/x-win-bitmap": "bmp",
  "image/x-windows-bmp": "bmp",
  "image/ms-bmp": "bmp",
  "image/x-ms-bmp": "bmp",
  "application/bmp": "bmp",
  "application/x-bmp": "bmp",
  "application/x-win-bitmap": "bmp",
  "application/cdr": "cdr",
  "application/coreldraw": "cdr",
  "application/x-cdr": "cdr",
  "application/x-coreldraw": "cdr",
  "image/cdr": "cdr",
  "image/x-cdr": "cdr",
  "zz-application/zz-winassoc-cdr": "cdr",
  "application/mac-compactpro": "cpt",
  "application/pkix-crl": "crl",
  "application/pkcs-crl": "crl",
  "application/x-x509-ca-cert": "crt",
  "application/pkix-cert": "crt",
  "text/css": "css",
  "text/csv": "csv",
  "text/x-comma-separated-values": "csv",
  "text/comma-separated-values": "csv",
  "application/vnd.msexcel": "csv",
  "application/x-director": "dcr",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/x-dvi": "dvi",
  "message/rfc822": "eml",
  "application/x-msdownload": "exe",
  "video/x-f4v": "f4v",
  "audio/x-flac": "flac",
  "video/x-flv": "flv",
  "image/gif": "gif",
  "application/gpg-keys": "gpg",
  "application/x-gtar": "gtar",
  "application/x-gzip": "gzip",
  "application/mac-binhex40": "hqx",
  "application/mac-binhex": "hqx",
  "application/x-binhex40": "hqx",
  "application/x-mac-binhex40": "hqx",
  "text/html": "html",
  "image/x-icon": "ico",
  "image/x-ico": "ico",
  "image/vnd.microsoft.icon": "ico",
  "text/calendar": "ics",
  "application/java-archive": "jar",
  "application/x-java-application": "jar",
  "application/x-jar": "jar",
  "image/jp2": "jp2",
  "video/mj2": "jp2",
  "image/jpx": "jp2",
  "image/jpm": "jp2",
  "image/jpeg": "jpeg",
  "image/pjpeg": "jpeg",
  "application/x-javascript": "js",
  "application/json": "json",
  "text/json": "json",
  "application/vnd.google-earth.kml+xml": "kml",
  "application/vnd.google-earth.kmz": "kmz",
  "text/x-log": "log",
  "audio/x-m4a": "m4a",
  "audio/mp4": "m4a",
  "application/vnd.mpegurl": "m4u",
  "audio/midi": "mid",
  "application/vnd.mif": "mif",
  "video/quicktime": "mov",
  "video/x-sgi-movie": "movie",
  "audio/mpeg": "mp3",
  "audio/mpg": "mp3",
  "audio/mpeg3": "mp3",
  "audio/mp3": "mp3",
  "video/mp4": "mp4",
  "video/mpeg": "mpeg",
  "application/oda": "oda",
  "audio/ogg": "ogg",
  "video/ogg": "ogg",
  "application/ogg": "ogg",
  "font/otf": "otf",
  "application/x-pkcs10": "p10",
  "application/pkcs10": "p10",
  "application/x-pkcs12": "p12",
  "application/x-pkcs7-signature": "p7a",
  "application/pkcs7-mime": "p7c",
  "application/x-pkcs7-mime": "p7c",
  "application/x-pkcs7-certreqresp": "p7r",
  "application/pkcs7-signature": "p7s",
  "application/pdf": "pdf",
  "application/octet-stream": "pdf",
  "application/x-x509-user-cert": "pem",
  "application/x-pem-file": "pem",
  "application/pgp": "pgp",
  "application/x-httpd-php": "php",
  "application/php": "php",
  "application/x-php": "php",
  "text/php": "php",
  "text/x-php": "php",
  "application/x-httpd-php-source": "php",
  "image/png": "png",
  "image/x-png": "png",
  "application/powerpoint": "ppt",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.ms-office": "ppt",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/x-photoshop": "psd",
  "image/vnd.adobe.photoshop": "psd",
  "audio/x-realaudio": "ra",
  "audio/x-pn-realaudio": "ram",
  "application/x-rar": "rar",
  "application/rar": "rar",
  "application/x-rar-compressed": "rar",
  "audio/x-pn-realaudio-plugin": "rpm",
  "application/x-pkcs7": "rsa",
  "text/rtf": "rtf",
  "text/richtext": "rtx",
  "video/vnd.rn-realvideo": "rv",
  "application/x-stuffit": "sit",
  "application/smil": "smil",
  "text/srt": "srt",
  "image/svg+xml": "svg",
  "image/svg": "svg",
  "application/x-shockwave-flash": "swf",
  "application/x-tar": "tar",
  "application/x-gzip-compressed": "tgz",
  "image/tiff": "tiff",
  "font/ttf": "ttf",
  "text/plain": "txt",
  "text/x-vcard": "vcf",
  "application/videolan": "vlc",
  "text/vtt": "vtt",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
  "audio/wav": "wav",
  "application/wbxml": "wbxml",
  "video/webm": "webm",
  "image/webp": "webp",
  "audio/x-ms-wma": "wma",
  "application/wmlc": "wmlc",
  "video/x-ms-wmv": "wmv",
  "video/x-ms-asf": "wmv",
  "font/woff": "woff",
  "font/woff2": "woff2",
  "application/xhtml+xml": "xhtml",
  "application/excel": "xl",
  "application/msexcel": "xls",
  "application/x-msexcel": "xls",
  "application/x-ms-excel": "xls",
  "application/x-excel": "xls",
  "application/x-dos_ms_excel": "xls",
  "application/xls": "xls",
  "application/x-xls": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-excel": "xlsx",
  "application/xml": "xml",
  "text/xml": "xml",
  "text/xsl": "xsl",
  "application/xspf+xml": "xspf",
  "application/x-compress": "z",
  "application/x-zip": "zip",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "application/s-compressed": "zip",
  "multipart/x-zip": "zip",
  "text/x-scriptzsh": "zsh",
}

/** `get_setting()` key that holds the max size of each file type; others use `max_upload_file_size`. */
export const FILE_SIZE_SETTINGS: Record<string, string[]> = {
  max_image_file_size: ["icon", "image"],
}

export function registerMimeTypes(type: string, mimeTypes: string[]) {
  ALLOWED_MIME_TYPES[type] = mimeTypes
}

export function registerMimeTypeExtensions(extensions: Record<string, string>) {
  Object.assign(MIME_TYPE_EXTENSIONS, extensions)
}

/** `AllowedMimeTypes::getAllowedMimeTypes`: the mime types of one or several types (all when empty). */
export function getAllowedMimeTypes(type: string | string[] = ""): string[] {
  if (Array.isArray(type)) return type.flatMap((t) => ALLOWED_MIME_TYPES[t] ?? [])
  return type ? (ALLOWED_MIME_TYPES[type] ?? []) : Object.values(ALLOWED_MIME_TYPES).flat()
}

/** `AllowedMimeTypes::getExtensions`: unique extensions of the given mime types. */
export function getExtensions(mimeTypes: string[]): string[] {
  return [...new Set(mimeTypes.map((m) => MIME_TYPE_EXTENSIONS[m]).filter((e): e is string => !!e))]
}

/** `AllowedMimeTypes::getFileSizeSetting`. */
export function getFileSizeSetting(type: string): string {
  for (const [key, types] of Object.entries(FILE_SIZE_SETTINGS)) if (types.includes(type)) return key
  return "max_upload_file_size"
}

/** `AllowedMimeTypes::getMaxFileSize`: the largest max size (KB) of the types, from `settings`. */
export function getMaxFileSize(types: string | string[], settings: Record<string, unknown>): number {
  const list = Array.isArray(types) ? types : types ? [types] : Object.keys(ALLOWED_MIME_TYPES)
  let max = 0
  for (const type of list) {
    let size = Number(settings[`max_${type}_file_size`])
    if (!size) size = Number(settings[getFileSizeSetting(type)])
    if (size > max) max = size
  }
  return max
}

/** `format_file_size`: KB → `"2MB"`, with the unit labels given. */
export function formatFileSize(
  kb: number,
  units: { kb: string; mb: string; gb: string } = { kb: "KB", mb: "MB", gb: "GB" },
): string {
  const bytes = kb * 1024
  if (bytes < 0) return ""
  const round = (n: number) => String(Math.round(n * 100) / 100)
  if (bytes < 1000000) return round(bytes / 1024) + units.kb
  if (bytes < 1000000000) return round(bytes / 1024 / 1024) + units.mb
  return round(bytes / 1024 / 1024 / 1024) + units.gb
}
