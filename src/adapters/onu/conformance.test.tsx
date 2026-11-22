import { mergeAdapters } from "../../core/adapter"
import { testAdapter } from "../../testing"
import { onu } from "."
import { onuEditor } from "./editor"

testAdapter(mergeAdapters(onu, onuEditor))
