import { render, screen } from "@testing-library/react"

import { fd } from "../../test/helpers"
import { FormsProvider } from "../core/provider"
import { Date as DateField, Datetime, Time, formatDateValue } from "./dates"
import { Form } from "./form"

// West of UTC, where an instant at UTC midnight is still the day before. Node reads `TZ` on every change.
const originalTz = process.env.TZ
beforeAll(() => {
  process.env.TZ = "America/New_York"
})
afterAll(() => {
  process.env.TZ = originalTz
})

describe("date values with a time zone", () => {
  it("runs in a zone west of UTC", () => {
    expect(new globalThis.Date("2024-05-01T00:00:00Z").getDate()).toBe(30)
  })

  it("keeps the calendar date of a Laravel date cast", () => {
    expect(formatDateValue("2024-05-01T00:00:00.000000Z", "date")).toBe("2024-05-01")
    expect(formatDateValue("2024-05-01 00:00:00", "date")).toBe("2024-05-01")
    expect(formatDateValue("2024-05-01", "date")).toBe("2024-05-01")
  })

  it("converts to the app's time zone when it is set", () => {
    // Laravel serializes a Maldives (UTC+5) date as the UTC instant of its midnight.
    expect(formatDateValue("2024-04-30T19:00:00.000000Z", "date", "Indian/Maldives")).toBe("2024-05-01")
    expect(formatDateValue("2024-05-01T04:30:00.000000Z", "datetime", "Indian/Maldives")).toBe("2024-05-01 09:30:00")
    expect(formatDateValue("2024-05-01T04:30:00+00:00", "time", "Indian/Maldives")).toBe("09:30")
  })

  it("leaves values without a zone as they are", () => {
    expect(formatDateValue("2024-05-01 09:30:00", "datetime", "Indian/Maldives")).toBe("2024-05-01 09:30:00")
    expect(formatDateValue("09:30", "time", "Indian/Maldives")).toBe("09:30")
  })

  it("keeps today's behaviour without the setting, and with an unknown zone", () => {
    expect(formatDateValue("2024-05-01T04:30:00.000000Z", "datetime")).toBe("2024-05-01 00:30:00")
    expect(formatDateValue("2024-05-01T04:30:00.000000Z", "datetime", "Not/AZone")).toBe("2024-05-01 00:30:00")
  })

  it("submits the app's wall time with the app_timezone setting", () => {
    const { container } = render(
      <FormsProvider settings={{ app_timezone: "Indian/Maldives" }}>
        <Form model={{ expires_on: "2024-04-30T19:00:00.000000Z", published_at: "2024-05-01T04:30:00.000000Z" }}>
          <DateField name="expires_on" label="ހަމަވާ ތާރީޚު" />
          <Datetime name="published_at" />
          <Time name="opens_at" value="2024-05-01T04:30:00Z" />
        </Form>
      </FormsProvider>,
    )
    expect(fd(container).get("expires_on")).toBe("2024-05-01")
    expect(fd(container).get("published_at")).toBe("2024-05-01 09:30:00")
    expect(fd(container).get("opens_at")).toBe("09:30")
    expect(screen.getByLabelText("ހަމަވާ ތާރީޚު")).toHaveValue("2024-05-01")
  })
})
