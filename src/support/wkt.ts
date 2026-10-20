/** `[lng, lat]` positions of polygon rings, as in GeoJSON. */
export type Rings = number[][][]

/** Parses a WKT `POLYGON((lng lat, …))` or `MULTIPOLYGON(((…)))` into polygons (lists of rings). */
export function parseWktPolygons(wkt: string | null | undefined): Rings[] {
  if (!wkt) return []
  const s = wkt.trim().toUpperCase()
  if (!s.startsWith("POLYGON") && !s.startsWith("MULTIPOLYGON")) return []
  const polygons: Rings[] = []
  // Each polygon is "((ring),(ring))"; split on the polygon boundaries.
  const body = wkt.slice(wkt.indexOf("(")).replace(/\s+/g, " ")
  const polygonTexts = s.startsWith("MULTI") ? body.slice(1, -1).split(/\)\s*\)\s*,\s*\(\s*\(/) : [body.slice(1, -1)]
  for (const text of polygonTexts) {
    const rings = text
      .replace(/^\(+|\)+$/g, "")
      .split(/\)\s*,\s*\(/)
      .map((ring) =>
        ring
          .replace(/[()]/g, "")
          .split(",")
          .map((pair) => pair.trim().split(" ").map(Number))
          .filter((p) => p.length >= 2 && p.every(Number.isFinite)),
      )
      .filter((ring) => ring.length)
    if (rings.length) polygons.push(rings)
  }
  return polygons
}

/** Writes polygons as WKT: `POLYGON` for one, `MULTIPOLYGON` for several, `""` for none. */
export function toWkt(polygons: Rings[]): string {
  const ring = (r: number[][]) => `(${r.map((p) => `${p[0]} ${p[1]}`).join(", ")})`
  const polygon = (rings: Rings) => `(${rings.map(ring).join(", ")})`
  if (!polygons.length) return ""
  if (polygons.length === 1) return `POLYGON${polygon(polygons[0]!)}`
  return `MULTIPOLYGON(${polygons.map(polygon).join(", ")})`
}
