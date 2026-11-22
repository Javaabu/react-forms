import * as React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"

import { fd } from "../../test/helpers"
import type { MapSlotProps } from "../core/adapter"
import { Form } from "./form"
import { MapInput } from "./map-input"

function FakeMap(props: MapSlotProps) {
  return (
    <button type="button" onClick={() => props.onPointChange({ lat: 1, lng: 2 })}>
      pick
    </button>
  )
}

describe("MapInput after mount", () => {
  it("shows a model that loads later", () => {
    function Page({ model }: { model: unknown }) {
      return (
        <Form action="/x" model={model} components={{ Map: FakeMap }}>
          <MapInput name="location" enableRadius />
        </Form>
      )
    }
    const { container, rerender } = render(<Page model={{ name: "ހުޅުމާލެ" }} />)
    expect(fd(container).get("lat")).toBe("")
    rerender(<Page model={{ lat: 4.175, lng: 73.509, radius: 250 }} />)
    expect(fd(container).get("lat")).toBe("4.175")
    expect(fd(container).get("lng")).toBe("73.509")
    expect(fd(container).get("radius")).toBe("250")
  })

  it("follows changed lat, lng and polygon props", () => {
    const square = "POLYGON((73.5 4.1, 73.6 4.1, 73.6 4.2, 73.5 4.1))"
    const { container, rerender } = render(
      <Form action="/x" components={{ Map: FakeMap }}>
        <MapInput name="location" lat={1} lng={2} />
        <MapInput name="area" enablePolygon polygonName="boundary" />
      </Form>,
    )
    rerender(
      <Form action="/x" components={{ Map: FakeMap }}>
        <MapInput name="location" lat={4.175} lng={73.509} />
        <MapInput name="area" enablePolygon polygonName="boundary" polygon={square} />
      </Form>,
    )
    expect(fd(container).get("lat")).toBe("4.175")
    expect(fd(container).get("boundary")).toMatch(/^POLYGON\(\(73\.5 4\.1/)
  })

  it("returns to the starting point when the form resets", async () => {
    const { container } = render(
      <Form
        action="/x"
        model={{ lat: 4.175, lng: 73.509 }}
        components={{ Map: FakeMap }}
        onSubmit={async () => {}}
        resetOnSuccess
      >
        <MapInput name="location" />
        <button type="submit">ސޭވް</button>
      </Form>,
    )
    fireEvent.click(screen.getByText("pick"))
    expect(fd(container).get("lat")).toBe("1")
    fireEvent.click(screen.getByText("ސޭވް"))
    await act(async () => {})
    expect(fd(container).get("lat")).toBe("4.175")
  })
})
