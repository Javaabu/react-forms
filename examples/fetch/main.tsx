import * as React from "react"
import { createRoot } from "react-dom/client"

import * as Forms from "../../src"
import { html } from "../../src/html"
import { user } from "../mock-laravel"
import { useDemoLocale } from "../shared/demo"
import "../html/styles.css"

function Page() {
  const { rtl, toggle } = useDemoLocale()
  const [message, setMessage] = React.useState<string | null>(null)
  return (
    <main>
      <h1>@javaabu/forms with fetch</h1>
      <Forms.Button color="light" onClick={toggle}>
        {rtl ? "English" : "ދިވެހި"}
      </Forms.Button>
      {message ? <Forms.Alert type="success">{message}</Forms.Alert> : null}
      <p>
        No Inertia: the fetch router posts the form. Clear the island and save: the 422 shows its errors under the
        fields.
      </p>
      <Forms.Form
        model={user}
        action="/demo/users/1"
        method="PATCH"
        onSuccess={(body) => setMessage((body as { message: string }).message)}
      >
        <Forms.Text name="name" label="ނަން" required thaana />
        <Forms.Email name="email" required />
        <Forms.Text name="address[city]" label="ރަށް" thaana />
        <Forms.Submit>ސޭވްކުރޭ</Forms.Submit>
      </Forms.Form>
    </main>
  )
}

createRoot(document.getElementById("root")!).render(
  <Forms.FormsProvider ui={html} router={Forms.fetchRouter} csrfToken="example-token">
    <Page />
  </Forms.FormsProvider>,
)
