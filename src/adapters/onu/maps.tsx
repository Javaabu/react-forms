"use client"

import type * as React from "react"
import { MapPicker, MapPolygon, MapRadius, type PolygonCollection } from "@javaabu/onu/maps"

import { defineAdapter, type MapSlotProps } from "../../core/adapter"

function toCollection(polygons: number[][][][]): PolygonCollection | null {
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

function OnuMap({
  mode,
  point,
  onPointChange,
  radius,
  onRadiusChange,
  maxRadius,
  polygons,
  onPolygonsChange,
  ...props
}: MapSlotProps): React.JSX.Element {
  if (mode === "polygon") {
    return (
      <MapPolygon
        {...props}
        multiple={false}
        value={toCollection(polygons)}
        onValueChange={(value) => onPolygonsChange(value ? value.features.map((f) => f.geometry.coordinates) : [])}
      />
    )
  }
  if (mode === "radius") {
    return (
      <MapRadius
        {...props}
        max={maxRadius}
        value={point && radius !== null ? { center: point, radius } : null}
        onValueChange={(value) => {
          onPointChange(value?.center ?? null)
          onRadiusChange(value?.radius ?? null)
        }}
      />
    )
  }
  // The core renders the latitude / longitude fields.
  return <MapPicker {...props} coordinates={false} value={point} onValueChange={onPointChange} />
}

/**
 * Onu's maps for `MapInput`. A separate entry because the maps are large:
 * `<FormsProvider ui={mergeAdapters(onu, onuMaps)}>`.
 */
export const onuMaps = defineAdapter({ name: "onu-maps", components: { Map: OnuMap } })
