import { render } from "@testing-library/react"

import type { MapSlotProps } from "../../core/adapter"

// Onu's maps need Google Maps and turf, which aren't installed here: record the props instead.
const seen: Record<string, unknown>[] = []
vi.mock("@javaabu/onu/maps", () => ({
  MapPolygon: (props: Record<string, unknown>) => (seen.push(props), null),
  MapRadius: () => null,
  MapPicker: () => null,
}))

const { onuMaps } = await import("./maps")
const Map = onuMaps.components.Map!

const square = (x: number) => [
  [
    [x, 4.1],
    [x + 0.1, 4.1],
    [x + 0.1, 4.2],
    [x, 4.1],
  ],
]

function renderPolygons(polygons: number[][][][], onPolygonsChange: MapSlotProps["onPolygonsChange"] = () => {}) {
  seen.length = 0
  render(
    <Map
      mode="polygon"
      point={null}
      onPointChange={() => {}}
      radius={null}
      onRadiusChange={() => {}}
      maxRadius={1000}
      polygons={polygons}
      onPolygonsChange={onPolygonsChange}
    />,
  )
  return seen.at(-1)!
}

describe("the Onu map's polygon mode", () => {
  it("draws one polygon, like Blade's Polygon boundary", () => {
    expect(renderPolygons([square(73.5)]).multiple).toBe(false)
    expect(renderPolygons([]).multiple).toBe(false)
  })

  it("lets every polygon of a bound MULTIPOLYGON be edited, and reports them all", () => {
    const changed = vi.fn()
    const props = renderPolygons([square(73.5), square(73.7)], changed)
    expect(props.multiple).toBe(true)
    const value = props.value as { features: { geometry: { coordinates: unknown } }[] }
    expect(value.features).toHaveLength(2)
    ;(props.onValueChange as (v: unknown) => void)(value)
    expect(changed).toHaveBeenCalledWith([square(73.5), square(73.7)])
  })
})
