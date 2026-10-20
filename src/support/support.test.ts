import { dataGet, looseIncludes, toFormString } from "./data"
import { parseDateValue, toDateString } from "./dates"
import { formatFileSize, getAllowedMimeTypes, getExtensions, getMaxFileSize } from "./mime-types"
import { normalizeOptions, relationValue, toSelectedValues } from "./options"
import { bracketsToDots, nameToId, nameToLabel, slotName } from "./str"
import { parseWktPolygons, toWkt } from "./wkt"

describe("str", () => {
  it("generates labels like javaabu/forms", () => {
    expect(nameToLabel("company_name")).toBe("Company Name")
    expect(nameToLabel("userId")).toBe("User Id")
    expect(nameToLabel("address[city]")).toBe("Address City")
    expect(nameToLabel("tags[]")).toBe("Tags")
    expect(nameToLabel("send_notifications")).toBe("Send Notifications")
  })

  it("generates ids and dot names", () => {
    expect(nameToId("address[city]")).toBe("address-city")
    expect(nameToId("tags[]")).toBe("tags")
    expect(bracketsToDots("items[0][name]")).toBe("items.0.name")
    expect(bracketsToDots("tags[]")).toBe("tags")
  })

  it("derives slot names", () => {
    expect(slotName("application-requirements")).toBe("applicationRequirements")
    expect(slotName("applicationRequirements")).toBe("applicationRequirements")
  })
})

describe("data", () => {
  it("reads dot paths", () => {
    const user = { profile: { city: "Malé" }, tags: [{ id: 1 }, { id: 2 }] }
    expect(dataGet(user, "profile.city")).toBe("Malé")
    expect(dataGet(user, "tags.1.id")).toBe(2)
    expect(dataGet(user, "tags.*.id")).toEqual([1, 2])
    expect(dataGet(user, "missing.key", "x")).toBe("x")
  })

  it("prints values like Blade", () => {
    expect(toFormString(true)).toBe("1")
    expect(toFormString(false)).toBe("")
    expect(toFormString(null)).toBe("")
    expect(looseIncludes([1, 2], "2")).toBe(true)
  })
})

describe("options", () => {
  it("treats a list as a PHP list (index keys)", () => {
    expect(normalizeOptions(["a", "b"])).toEqual([
      { value: "0", label: "a" },
      { value: "1", label: "b" },
    ])
  })

  it("reads key → label objects, pairs, records and ChoiceOptions", () => {
    expect(normalizeOptions({ be: "Belgium" })).toEqual([{ value: "be", label: "Belgium" }])
    expect(
      normalizeOptions([
        [10, "Ten"],
        [5, "Five"],
      ]).map((o) => o.value),
    ).toEqual(["10", "5"])
    expect(normalizeOptions([{ id: 3, name: "Malé" }])[0]).toMatchObject({ value: "3", label: "Malé" })
    expect(
      normalizeOptions([{ code: "MV", formatted_name: "Maldives" }], {
        idField: "code",
        nameField: "formatted_name",
      })[0],
    ).toMatchObject({
      value: "MV",
      label: "Maldives",
    })
    expect(normalizeOptions([{ value: "x", label: "X" }])).toEqual([{ value: "x", label: "X" }])
  })

  it("selects model keys, collections and enums", () => {
    expect(toSelectedValues({ id: 4, name: "x" })).toEqual(["4"])
    expect(toSelectedValues([{ id: 1 }, { id: 2 }])).toEqual(["1", "2"])
    expect(toSelectedValues({ value: "draft", label: "Draft" })).toEqual(["draft"])
    expect(toSelectedValues(null)).toEqual([])
  })

  it("reads relation values", () => {
    expect(relationValue({ country_id: 5, country: { id: 9 } }, "country", false)).toBe(5)
    expect(relationValue({ tags: [{ id: 1 }, { id: 3 }] }, "tags", true)).toEqual(["1", "3"])
  })
})

describe("dates", () => {
  it("parses Laravel date strings as local time", () => {
    expect(toDateString(parseDateValue("2024-05-01")!)).toBe("2024-05-01")
    const d = parseDateValue("2024-05-01 10:30:00")!
    expect([d.getHours(), d.getMinutes()]).toEqual([10, 30])
    expect(parseDateValue("2024-05-01T10:30:00.000000Z")!.toISOString()).toBe("2024-05-01T10:30:00.000Z")
    expect(parseDateValue("")).toBeNull()
  })
})

describe("mime types", () => {
  it("ports AllowedMimeTypes", () => {
    expect(getAllowedMimeTypes("document")).toEqual(["application/pdf", "image/jpeg", "image/png"])
    expect(getExtensions(getAllowedMimeTypes("document"))).toEqual(["pdf", "jpeg", "png"])
    expect(getMaxFileSize("image", { max_image_file_size: 2048, max_upload_file_size: 10240 })).toBe(2048)
    expect(getMaxFileSize(["document", "image"], { max_image_file_size: 2048, max_upload_file_size: 10240 })).toBe(
      10240,
    )
  })

  it("formats sizes like format_file_size", () => {
    expect(formatFileSize(2048)).toBe("2MB")
    expect(formatFileSize(500)).toBe("500KB")
  })
})

describe("wkt", () => {
  it("round-trips polygons", () => {
    const wkt = "POLYGON((73.5 4.17, 73.51 4.17, 73.51 4.18, 73.5 4.17))"
    const polygons = parseWktPolygons(wkt)
    expect(polygons[0]![0]).toHaveLength(4)
    expect(toWkt(polygons)).toBe(wkt)
  })
})
