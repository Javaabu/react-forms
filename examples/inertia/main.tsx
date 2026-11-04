import { createInertiaApp, usePage } from "@inertiajs/react"
import { createRoot } from "react-dom/client"

import * as Forms from "../../src"
import { inertia, inertiaLinks } from "../../src/inertia"
import { html } from "../../src/html"
import { user as initialUser } from "../mock-laravel"
import { useDemoLocale } from "../shared/demo"
import "../html/styles.css"

const ui = Forms.mergeAdapters(html, inertiaLinks)

// Wayfinder would generate this: `update(user)` → { url, method }.
const update = (args: { id: number }) => ({ url: `/demo/users/${args.id}`, method: "put" as const })

function Edit() {
  const { user, flash } = usePage<{ user: typeof initialUser; flash: string | null }>().props
  const { rtl, toggle } = useDemoLocale()
  return (
    <main>
      <h1>@javaabu/forms with Inertia</h1>
      <Forms.Button color="light" onClick={toggle}>
        {rtl ? "English" : "ދިވެހި"}
      </Forms.Button>
      {flash ? <Forms.Alert type="success">{flash}</Forms.Alert> : null}
      <p>Clear the island and save: the mock server validates like Laravel, and its errors appear under the fields.</p>
      <Forms.Form model={user} action={update} preserveScroll summary>
        <Forms.Text name="name" label="ނަން" required thaana />
        <Forms.Email name="email" required />
        <Forms.Text name="address[city]" label="ރަށް" thaana />
        <Forms.Checkbox name="channels[]" value="email" label="Email" />
        <Forms.Checkbox name="channels[]" value="sms" label="SMS" />
        <Forms.Submit>ސޭވްކުރޭ</Forms.Submit>
      </Forms.Form>
    </main>
  )
}

void createInertiaApp({
  page: {
    component: "Users/Edit",
    props: { errors: {}, user: initialUser, flash: null },
    url: "/inertia.html",
    version: null,
  } as never,
  resolve: () => Edit,
  setup({ el, App, props }) {
    createRoot(el!).render(
      <Forms.FormsProvider ui={ui} router={inertia}>
        <App {...props} />
      </Forms.FormsProvider>,
    )
  },
})
