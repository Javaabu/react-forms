import { mergeAdapters } from "../../core/adapter"
import { testAdapter } from "../../testing"
import { onu } from "."
import { onuEditor } from "./editor"

// Onu's Accordion unmounts closed items and has no forceMount yet: https://github.com/Javaabu/onu/issues/60
testAdapter(mergeAdapters(onu, onuEditor), {
  skip: ["Accordions keep closed items mounted and open the item of an invalid field"],
})
