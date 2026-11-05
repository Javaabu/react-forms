"use client"

import type * as React from "react"

import type { IconName } from "../core/adapter"
import { useUi } from "../core/provider"

export interface IconProps {
  /** A bundled Lucide name (`pencil`, `trash-2`, …, as in Blade) or icon font classes (`fa-solid fa-mosque`). */
  name: IconName
  size?: "sm" | "md"
  className?: string
}

/** `<x-forms::icon>`: an icon from the adapter's icon set, hidden from screen readers. */
export function Icon(props: IconProps): React.JSX.Element {
  const ui = useUi()
  return <ui.Icon {...props} />
}
