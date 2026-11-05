"use client"

import * as React from "react"

/** Calls `onReveal` when a field inside `ref` asks to be shown (`forms:reveal`, sent before it is focused). */
export function useReveal(ref: React.RefObject<HTMLElement | null>, onReveal: () => void) {
  const callback = React.useRef(onReveal)
  React.useEffect(() => {
    callback.current = onReveal
  })
  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const listener = () => callback.current()
    node.addEventListener("forms:reveal", listener)
    return () => node.removeEventListener("forms:reveal", listener)
  }, [ref])
}

export interface TabPanelProps extends React.ComponentProps<"div"> {
  /** Whether the panel's tab is selected. Inactive panels stay mounted (their fields still submit) but hidden. */
  active: boolean
  /** Select the panel's tab, when a field inside has an error to show. */
  onReveal: () => void
}

/**
 * A tab panel for adapters: always mounted, so fields in other tabs keep their
 * values and submit, hidden while inactive, and opened when a field inside is
 * invalid. Use it for the `Tabs` slot if your tab component unmounts inactive panels.
 */
export function TabPanel({ active, onReveal, children, ...props }: TabPanelProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  useReveal(ref, onReveal)
  return (
    <div ref={ref} role="tabpanel" data-state={active ? "active" : "inactive"} hidden={!active} {...props}>
      {children}
    </div>
  )
}
