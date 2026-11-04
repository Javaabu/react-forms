import { dv } from "./dv"
import { en, type FormsMessages } from "./en"

export { en, dv, type FormsMessages }

/** Built-in locales by code; others fall back to English. */
export const locales: Record<string, FormsMessages> = { en, dv }
