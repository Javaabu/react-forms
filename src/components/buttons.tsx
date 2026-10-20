"use client"

import * as React from "react"
import {
  Button as OnuButton,
  ButtonGroup as OnuButtonGroup,
  LinkButton as OnuLinkButton,
  useOnuForm,
  type ButtonProps as OnuButtonProps,
  type ButtonVariant,
} from "@javaabu/onu"
import { useSyncedState } from "../support/use-synced-state"

/** Bootstrap colour names (Blade's `color`) and the Onu variants they map to. */
export type ButtonColor =
  "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "link" | `outline-${string}`

const VARIANTS: Record<string, ButtonVariant> = {
  primary: "default",
  secondary: "secondary",
  success: "success",
  danger: "destructive",
  warning: "warning",
  info: "default",
  light: "outline",
  dark: "secondary",
  link: "link",
}

/** The Onu variant for a Blade button colour (`outline-*` → `outline`). */
export function colorToVariant(color: string | undefined): ButtonVariant {
  if (!color) return "default"
  if (color.startsWith("outline-")) return "outline"
  return VARIANTS[color] ?? "default"
}

export interface ButtonProps extends Omit<OnuButtonProps, "color"> {
  /** Bootstrap colour (`primary`, `danger`, …). Ignored when `variant` is set. Default `primary`. */
  color?: ButtonColor
  /**
   * Show a spinner once the form submits (js-utilities' `animate-submit`): on a
   * valid native submit, or while the surrounding `Form`'s `onSubmit` runs.
   */
  animate?: boolean
}

/** `<x-forms::button>`. */
export function Button({ color = "primary", variant, animate, type, onClick, loading, ...props }: ButtonProps) {
  const form = useOnuForm()
  // A click starts the spinner; any change of the form's status (submitting, error, …) resets it.
  const [clicked, setClicked] = useSyncedState(false, form?.status)

  return (
    <OnuButton
      {...props}
      type={type}
      variant={variant ?? colorToVariant(color)}
      loading={loading ?? (animate ? clicked || !!form?.processing : undefined)}
      onClick={(event) => {
        onClick?.(event)
        if (!animate || event.defaultPrevented) return
        const owner = event.currentTarget.form
        if (owner && owner.checkValidity()) setClicked(true)
      }}
    />
  )
}

/** `<x-forms::submit>`: a submit button that shows a spinner while the form submits. */
export function Submit({ animate = true, ...props }: Omit<ButtonProps, "type">) {
  return <Button {...props} type="submit" animate={animate} />
}

export interface LinkButtonProps extends Omit<React.ComponentProps<typeof OnuLinkButton>, "href" | "color"> {
  url?: string
  color?: ButtonColor
}

/** `<x-forms::link-button>`: a link styled as a button. */
export function LinkButton({ url, color = "primary", variant, ...props }: LinkButtonProps) {
  return <OnuLinkButton {...props} href={url ?? "#"} variant={variant ?? colorToVariant(color)} />
}

export interface ButtonGroupProps extends React.ComponentProps<typeof OnuButtonGroup> {
  /** `false` stacks the buttons vertically. Default `true`. */
  inline?: boolean
}

/** `<x-forms::button-group>`. */
export function ButtonGroup({ inline = true, orientation, ...props }: ButtonGroupProps) {
  return <OnuButtonGroup {...props} orientation={orientation ?? (inline ? "horizontal" : "vertical")} />
}
