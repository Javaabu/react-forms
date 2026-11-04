import { createRoot } from "react-dom/client"

import * as ui from "../../test/shadcn"
import { FormsProvider } from "../../src"
import { createShadcnAdapter } from "../../src/shadcn"
import { Demo } from "../shared/demo"
import "./styles.css"

// In an app: import each component from "@/components/ui/…".
const shadcn = createShadcnAdapter(ui)

createRoot(document.getElementById("root")!).render(
  <FormsProvider ui={shadcn}>
    <Demo title="@javaabu/forms with shadcn/ui" />
  </FormsProvider>,
)
