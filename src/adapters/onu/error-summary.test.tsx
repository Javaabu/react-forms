import { fireEvent, render, waitFor } from "@testing-library/react"

import { Tabs, TabsPane } from "../../components/display"
import { Form } from "../../components/form"
import { Text } from "../../components/inputs"
import { FormsProvider } from "../../core/provider"
import { onu } from "."

describe("the Onu error summary", () => {
  it("focuses nested fields and opens the tab of a field from its links", async () => {
    const { container } = render(
      <FormsProvider ui={onu}>
        <Form errors={{ "items.0.name": "ނަން ލިޔުއްވާ.", bio: "ތަޢާރަފު ލިޔުއްވާ." }} summary focusOnError={false}>
          <Tabs tabs={[{ name: "general" }, { name: "about" }]}>
            <TabsPane name="general">
              <Text name="items[0][name]" label="ނަން" />
            </TabsPane>
            <TabsPane name="about">
              <Text name="bio" label="ތަޢާރަފު" />
            </TabsPane>
          </Tabs>
        </Form>
      </FormsProvider>,
    )
    const bio = container.querySelector<HTMLInputElement>('[name="bio"]')!
    const shown = (el: Element) =>
      !el.closest("[hidden]") && el.closest('[role="tabpanel"]')?.getAttribute("data-state") !== "inactive"
    expect(shown(bio)).toBe(false)

    fireEvent.click(container.querySelector("[data-slot=validation-summary] a[data-field=bio]")!)
    await waitFor(() => expect(shown(bio)).toBe(true))
    await waitFor(() => expect(document.activeElement).toBe(bio))

    fireEvent.click(container.querySelector('[data-slot=validation-summary] a[data-field="items.0.name"]')!)
    const name = container.querySelector('[name="items[0][name]"]')!
    await waitFor(() => expect(document.activeElement).toBe(name))
  })
})
