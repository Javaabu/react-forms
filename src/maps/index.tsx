"use client"

import * as React from "react"
import { MapPicker, MapPolygon, MapRadius, type LatLng, type PolygonCollection } from "@javaabu/onu/maps"

import { useFieldValue } from "../context/binding"
import { useSetting } from "../context/forms-provider"
import { FieldWrapper, splitFieldProps, useFieldNames, type FieldProps } from "../components/field"
import { Hidden } from "../components/inputs"
import { isNil } from "../support/data"
import { parseWktPolygons, toWkt } from "../support/wkt"

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

function toCollection(wkt: string | null): PolygonCollection | null {
  const polygons = parseWktPolygons(wkt)
  if (!polygons.length) return null
  return {
    type: "FeatureCollection",
    features: polygons.map((rings) => ({
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: rings as [number, number][][] },
    })),
  }
}

/**
 * `<x-forms::map-input>`: pick a point, a radius or a boundary on a map
 * (`@javaabu/onu/maps`). Submits `lat`, `lng`, `radius` and `boundary` (WKT)
 * as separate fields, like the Blade component.
 */
export function MapInput(props: MapInputProps) {
  const { field, rest } = splitFieldProps({ ...props, default: undefined })
  const {
    latName = "lat",
    lngName = "lng",
    radiusName = "radius",
    polygonName = "boundary",
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
  const names = useFieldNames(field)
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
  const [polygons, setPolygons] = React.useState<PolygonCollection | null>(() =>
    toCollection(polygonProp ?? (typeof boundPolygon === "string" ? boundPolygon : null)),
  )

  const centerLat = defaultMapCenterLat ?? toNumber(settingLat)
  const centerLng = defaultMapCenterLng ?? toNumber(settingLng)
  const center = centerLat !== null && centerLng !== null ? { lat: centerLat, lng: centerLng } : undefined
  const common = { id: names.id, name: "", disabled: field.disabled, required: field.required, center, className }
  const round = (n: number, digits: number) => Number(n.toFixed(digits))

  let control: React.ReactNode
  if (enablePolygon) {
    control = <MapPolygon {...common} multiple={false} value={polygons} onChange={setPolygons} />
  } else if (enableRadius) {
    control = (
      <MapRadius
        {...common}
        max={maxRadius}
        value={point && radius !== null ? { center: point, radius } : null}
        onChange={(v) => {
          setPoint(v?.center ?? null)
          setRadius(v?.radius ?? null)
        }}
      />
    )
  } else {
    control = <MapPicker {...common} coordinates={!hideInputs} value={point} onChange={setPoint} />
  }

  const wkt = polygons ? toWkt(polygons.features.map((f) => f.geometry.coordinates as number[][][])) : ""

  return (
    <FieldWrapper {...field} id={names.id} label={names.label}>
      {control}
      <Hidden name={latName} value={point ? round(point.lat, 6) : ""} model={false} disabled={field.disabled} />
      <Hidden name={lngName} value={point ? round(point.lng, 6) : ""} model={false} disabled={field.disabled} />
      {enableRadius ? (
        <Hidden
          name={radiusName}
          value={radius === null ? "" : round(radius / unitFactor, radiusPrecision)}
          model={false}
          disabled={field.disabled}
        />
      ) : null}
      {enablePolygon ? <Hidden name={polygonName} value={wkt} model={false} disabled={field.disabled} /> : null}
    </FieldWrapper>
  )
}
