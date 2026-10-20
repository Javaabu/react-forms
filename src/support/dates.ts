import { isNil } from "./data"

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * Parses what Laravel sends for dates: `2024-05-01`, `2024-05-01 10:30:00`,
 * ISO strings (`2024-05-01T10:30:00.000000Z`), times (`10:30`), timestamps and
 * `Date` objects. Strings without a time zone are read as local time, like flatpickr does.
 */
export function parseDateValue(value: unknown, reference: Date = new Date()): Date | null {
  if (isNil(value) || value === "") return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === "number") return new Date(value)
  if (typeof value !== "string") return null

  const s = value.trim()
  const time = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s)
  if (time) {
    const d = new Date(reference)
    d.setHours(Number(time[1]), Number(time[2]), Number(time[3] ?? 0), 0)
    return d
  }

  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/.exec(s)
  if (!m) {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (m[7]) {
    const d = new Date(s.replace(" ", "T"))
    return Number.isNaN(d.getTime()) ? null : d
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0), Number(m[6] ?? 0))
}

/** `yyyy-MM-dd` in local time. */
export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** `yyyy-MM-dd HH:mm:ss` in local time. */
export function toDateTimeString(d: Date): string {
  return `${toDateString(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** `HH:mm` in local time. */
export function toTimeString(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
