import { createRoot } from "react-dom/client"
import { OnuProvider, ThemeProvider } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"
import { useTranslation } from "@javaabu/i18n/react"

import { FormsProvider, mergeAdapters } from "../../src"
import { onu } from "../../src/onu"
import { onuEditor } from "../../src/onu-editor"
import { Demo } from "../shared/demo"
import "./styles.css"

const ui = mergeAdapters(onu, onuEditor)

function App() {
  const { direction } = useTranslation()
  return (
    <ThemeProvider>
      {/* Onu has its own locale for its built-in strings; keep it in step with the page. */}
      <OnuProvider locale={direction === "rtl" ? dv : undefined}>
        <FormsProvider ui={ui} settings={{ max_upload_file_size: 10240, max_image_file_size: 2048 }}>
          <Demo title="@javaabu/forms with Onu" />
        </FormsProvider>
      </OnuProvider>
    </ThemeProvider>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
