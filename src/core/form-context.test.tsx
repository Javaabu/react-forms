import { setIn } from "./form-context"

describe("setIn", () => {
  it("creates arrays for numeric segments", () => {
    expect(setIn({}, "items.0.name", "ޢަލީ")).toEqual({ items: [{ name: "ޢަލީ" }] })
    expect(setIn(undefined, "0", "x")).toEqual(["x"])
  })

  it("creates objects for other segments and keeps what is there", () => {
    expect(setIn({ items: [{ name: "a" }] }, "items.1.name", "b")).toEqual({ items: [{ name: "a" }, { name: "b" }] })
    expect(setIn({ address: { city: "މާލެ" } }, "address.island", "ހުޅުމާލެ")).toEqual({
      address: { city: "މާލެ", island: "ހުޅުމާލެ" },
    })
  })
})
