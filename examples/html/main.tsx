import { createRoot } from "react-dom/client"

import { FormsProvider } from "../../src"
import { html } from "../../src/html"
import { Demo } from "../shared/demo"
import "./styles.css"

// `html` is also the default; passing it here only makes the choice visible.
createRoot(document.getElementById("root")!).render(
  <FormsProvider ui={html}>
    <Demo title="@javaabu/forms with plain HTML" />
  </FormsProvider>,
)
