"use client"

import * as React from "react"

import type { LatLng } from "../core/adapter"
import { useFieldValue } from "../core/binding"
import { useSetting, useUi } from "../core/provider"
import { useFormsTranslation } from "../core/strings"
import { isNil } from "../support/data"
import { parseWktPolygons, toWkt } from "../support/wkt"
import { splitFieldProps, useField, type FieldProps } from "./field"
import { Hidden, Latitude, Longitude, Number as NumberField } from "./inputs"

export interface MapInputProps extends Omit<FieldProps, "default"> {
  /** Name of the latitude input. Default `lat`. */
  latName?: string
  /** Name of the longitude input. Default `lng`. */
  lngName?: string
  /** Name of the radius input. Default `radius`. */
  radiusName?: string
  /** Name of the polygon (WKT) input. Default `boundary`. */
  polygonName?: string
  /** Pick a point. Default `true`. */
  enableCoordinates?: boolean
  /** Pick a centre and a radius. */
  enableRadius?: boolean
  /** Draw a boundary, submitted as WKT. */
  enablePolygon?: boolean
  /** Hide the latitude / longitude fields. */
  hideInputs?: boolean
  /** Decimals of the radius. Default `0`. */
  radiusPrecision?: number
  /** Largest radius (m). Default `6371000`. */
  maxRadius?: number
  /** Unit the radius is submitted in: `m` or `km`. Default `m`. */
  radiusUnit?: "m" | "km"
  lat?: number | null
  lng?: number | null
  radius?: number | null
  /** WKT polygon. */
  polygon?: string | null
  defaultLat?: number
  defaultLng?: number
  defaultRadius?: number
  defaultPolygon?: string
  /** Where the map opens when empty. Default: the `default_lat` / `default_lng` settings. */
  defaultMapCenterLat?: number
  defaultMapCenterLng?: number
  className?: string
}

function toNumber(value: unknown): number | null {
  if (isNil(value) || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** Reads a point from `{ lat, lng }`, `{ latitude, longitude }` or a GeoJSON `Point`. */
function pointOf(value: unknown): LatLng | null {
  if (!value || typeof value !== "object") return null
  const v = value as Record<string, unknown>
  if (v.type === "Point" && Array.isArray(v.coordinates)) {
    const [lng, lat] = v.coordinates as number[]
    return isNil(lat) || isNil(lng) ? null : { lat, lng }
  }
  const lat = toNumber(v.lat ?? v.latitude)
  const lng = toNumber(v.lng ?? v.longitude)
  return lat === null || lng === null ? null : { lat, lng }
}

/**
 * `<x-forms::map-input>`: pick a point, a radius or a boundary on a map
 * (from the adapter: `@javaabu/forms/onu/maps` for Onu's maps). Submits `lat`, `lng`, `radius` and `boundary` (WKT)
 * as separate fields, like the Blade component.
 */
export function MapInput(props: MapInputProps) {
  const { field, rest } = splitFieldProps({ ...props, default: undefined })
  const {
    latName = "lat",
    lngName = "lng",
    radiusName = "radius",
    polygonName = "boundary",
    enableCoordinates,
    enableRadius,
    enablePolygon,
    hideInputs,
    radiusPrecision = 0,
    maxRadius = 6371000,
    radiusUnit = "m",
    lat: latProp,
    lng: lngProp,
    radius: radiusProp,
    polygon: polygonProp,
    defaultLat,
    defaultLng,
    defaultRadius,
    defaultPolygon,
    defaultMapCenterLat,
    defaultMapCenterLng,
    className,
  } = rest
  const ui = useUi()
  const { t } = useFormsTranslation()
  const f = useField(field)
  const settingLat = useSetting<number>("default_lat")
  const settingLng = useSetting<number>("default_lng")

  const main = pointOf(useFieldValue(field.name, field.model, undefined))
  const boundLat = toNumber(useFieldValue(latName, field.model, defaultLat))
  const boundLng = toNumber(useFieldValue(lngName, field.model, defaultLng))
  const boundRadius = toNumber(useFieldValue(radiusName, field.model, defaultRadius))
  const boundPolygon = useFieldValue(polygonName, field.model, defaultPolygon)

  const lat = latProp ?? boundLat ?? main?.lat ?? null
  const lng = lngProp ?? boundLng ?? main?.lng ?? null
  const unitFactor = radiusUnit === "km" ? 1000 : 1
  const initialRadius = radiusProp ?? boundRadius

  const [point, setPoint] = React.useState<LatLng | null>(lat !== null && lng !== null ? { lat, lng } : null)
  const [radius, setRadius] = React.useState<number | null>(initialRadius === null ? null : initialRadius * unitFactor)
  const [polygons, setPolygons] = React.useState<number[][][][]>(() =>
    parseWktPolygons(polygonProp ?? (typeof boundPolygon === "string" ? boundPolygon : null)),
  )

  const centerLat = defaultMapCenterLat ?? toNumber(settingLat)
  const centerLng = defaultMapCenterLng ?? toNumber(settingLng)
  const center = centerLat !== null && centerLng !== null ? { lat: centerLat, lng: centerLng } : undefined
  const round = (n: number, digits: number) => Number(n.toFixed(digits))
  const mode = enablePolygon ? "polygon" : enableRadius ? "radius" : "point"
  const disabled = f.disabled || undefined
  const coordinates = mode !== "polygon" && enableCoordinates !== false && !hideInputs

  return f.wrap(
    <div className="gap-3 grid">
      <ui.Map
        id={f.id}
        disabled={disabled}
        className={className}
        mode={mode}
        point={point}
        onPointChange={setPoint}
        radius={radius}
        onRadiusChange={setRadius}
        maxRadius={maxRadius}
        polygons={polygons}
        onPolygonsChange={setPolygons}
        center={center}
      />
      {coordinates ? (
        <div className="gap-3 grid sm:grid-cols-2">
          <Latitude
            name={latName}
            label={t("latitude")}
            model={false}
            disabled={disabled}
            value={point ? round(point.lat, 6) : null}
            onValueChange={(n) => setPoint(n === null ? null : { lat: n, lng: point?.lng ?? center?.lng ?? 0 })}
          />
          <Longitude
            name={lngName}
            label={t("longitude")}
            model={false}
            disabled={disabled}
            value={point ? round(point.lng, 6) : null}
            onValueChange={(n) => setPoint(n === null ? null : { lat: point?.lat ?? center?.lat ?? 0, lng: n })}
          />
        </div>
      ) : null}
      {mode === "radius" && !hideInputs ? (
        <NumberField
          name={radiusName}
          label={t("radius")}
          model={false}
          min={0}
          max={maxRadius / unitFactor}
          decimals={radiusPrecision}
          append={radiusUnit === "km" ? t("km_abbr") : t("meters_abbr")}
          disabled={disabled}
          value={radius === null ? null : round(radius / unitFactor, radiusPrecision)}
          onValueChange={(n) => setRadius(n === null ? null : n * unitFactor)}
        />
      ) : null}
      {coordinates ? null : (
        <>
          <Hidden name={latName} value={point ? round(point.lat, 6) : ""} model={false} disabled={disabled} />
          <Hidden name={lngName} value={point ? round(point.lng, 6) : ""} model={false} disabled={disabled} />
        </>
      )}
      {mode === "radius" && hideInputs ? (
        <Hidden
          name={radiusName}
          value={radius === null ? "" : round(radius / unitFactor, radiusPrecision)}
          model={false}
          disabled={disabled}
        />
      ) : null}
      {mode === "polygon" ? (
        <Hidden name={polygonName} value={polygons.length ? toWkt(polygons) : ""} model={false} disabled={disabled} />
      ) : null}
    </div>,
  )
}
