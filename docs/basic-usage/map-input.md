---
title: Map input
sidebar_position: 8.5
---

```tsx
import { MapInput } from "@javaabu/react-forms/maps"

<MapInput name="location" model={venue} />
<MapInput name="area" enableRadius radiusUnit="km" />
<MapInput name="zone" enablePolygon polygonName="boundary" />
```

This uses Onu's `MapPicker`, `MapRadius` and `MapPolygon` (set up `MapProvider` as Onu's map docs describe). Like the Blade component, it submits separate `lat`, `lng`, `radius` and `boundary` (WKT `POLYGON`) fields.

| Prop | Default | Description |
| --- | --- | --- |
| `latName` / `lngName` / `radiusName` / `polygonName` | `lat` / `lng` / `radius` / `boundary` | Field names. |
| `enableRadius` / `enablePolygon` | `false` | Radius or boundary instead of a point. |
| `hideInputs` | `false` | Hide the coordinate fields. |
| `radiusPrecision`, `maxRadius`, `radiusUnit` | `0`, `6371000`, `m` | Radius settings. |
| `lat`, `lng`, `radius`, `polygon`, `default*` | | Values; otherwise bound from the model (`lat`/`lng` or a point at `name`). |
| `defaultMapCenterLat` / `Lng` | `default_lat` / `default_lng` settings | Where the map opens. |

## Accessibility

Onu's map inputs have typed coordinate fields as a text alternative to the map.
