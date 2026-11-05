---
title: Map input
sidebar_position: 8.5
---

`MapInput` picks a point, a centre and radius, or a boundary. Like the Blade component, it submits separate `lat`, `lng`, `radius` and `boundary` (WKT `POLYGON`) fields.

```blade
<x-forms::map-input name="location" :model="$venue" />
```

```tsx
import { Form, MapInput, Submit } from "@javaabu/forms"

export function VenueForm({ venue }) {
  return (
    <Form model={venue} action={`/venues/${venue.id}`} method="PATCH">
      <MapInput name="location" label="ތަން" />
      <MapInput name="area" enableRadius radiusUnit="km" />
      <MapInput name="zone" enablePolygon polygonName="boundary" />
      <Submit />
    </Form>
  )
}
```

# The map

The map itself comes from the adapter's `Map` slot. For Onu's maps, add `onuMaps` and set up Onu's map provider (a Google Maps API key) as Onu's map docs describe:

```tsx
import { FormsProvider, mergeAdapters } from "@javaabu/forms"
import { onu } from "@javaabu/forms/onu"
import { onuMaps } from "@javaabu/forms/onu/maps"

const ui = mergeAdapters(onu, onuMaps)

<FormsProvider ui={ui}>…</FormsProvider>
```

Without a map (the HTML and shadcn adapters, or Onu without `onuMaps`), `MapInput` shows only its latitude, longitude and radius fields, so people can still type coordinates. A boundary (`enablePolygon`) needs a map to draw; without one, only the bound value is submitted.

# Values

The point is read from `lat` / `lng` (or `latName` / `lngName`) on the bound model, or from a point at `name` (`{ lat, lng }`, `{ latitude, longitude }` or a GeoJSON `Point`). The radius is read from `radius`, and the boundary from `boundary` as WKT. Props (`lat`, `lng`, `radius`, `polygon`) win over the model, and `defaultLat`, `defaultLng`, `defaultRadius`, `defaultPolygon` apply when the model has no value.

# Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `latName`, `lngName`, `radiusName`, `polygonName` | `string` | `lat`, `lng`, `radius`, `boundary` | Names of the submitted fields. |
| `enableCoordinates` | `boolean` | `true` | Show the latitude and longitude fields (not with `enablePolygon`). |
| `enableRadius` | `boolean` | `false` | Pick a centre and a radius. |
| `enablePolygon` | `boolean` | `false` | Draw a boundary, submitted as WKT. |
| `hideInputs` | `boolean` | `false` | Hide the coordinate and radius fields; they are submitted as hidden inputs. |
| `radiusPrecision` | `number` | `0` | Decimals of the radius. |
| `maxRadius` | `number` (m) | `6371000` | Largest radius. |
| `radiusUnit` | `"m" \| "km"` | `m` | Unit the radius is shown and submitted in. |
| `lat`, `lng`, `radius`, `polygon` | | | Values that win over the model. |
| `defaultLat`, `defaultLng`, `defaultRadius`, `defaultPolygon` | | | Values when the model has none. |
| `defaultMapCenterLat`, `defaultMapCenterLng` | `number` | the `default_lat` / `default_lng` settings | Where the map opens when empty. |
| `className` | `string` | | Classes for the map. |

Plus the common field props except `default` ([Inputs](./inputs-and-textarea#props)).

# Accessibility

The latitude, longitude and radius fields are a text alternative to the map, and each has its own label and errors.
