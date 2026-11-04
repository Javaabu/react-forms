"use client"

import * as React from "react"

import type { ButtonColor, ButtonSlotProps, LinkButtonSlotProps } from "../core/adapter"
import { useFormState } from "../core/form-context"
import { useUi } from "../core/provider"
import { useSyncedState } from "../support/use-synced-state"

export type { ButtonColor }

export interface ButtonProps extends Omit<ButtonSlotProps, "color"> {
  /** Bootstrap colour (`primary`, `danger`, `outline-secondary`, …). Default `primary`. */
  color?: ButtonColor
  /**
   * Show a spinner once the form submits (js-utilities' `animate-submit`): on a
   * valid native submit, or while the surrounding `Form` processes.
   */
  animate?: boolean
}

/** `<x-forms::button>`. */
export function Button({ color = "primary", animate, type = "button", onClick, loading, ...props }: ButtonProps) {
  const ui = useUi()
  const form = useFormState()
  // A click starts the spinner; any change of the form's status (submitting, error, …) resets it.
  const [clicked, setClicked] = useSyncedState(false, form?.status)

  return (
    <ui.Button
      {...props}
      type={type}
      color={color}
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

export interface LinkButtonProps extends Omit<LinkButtonSlotProps, "href" | "color"> {
  url?: string
  color?: ButtonColor
}

/** `<x-forms::link-button>`: a link styled as a button. */
export function LinkButton({ url, color = "primary", ...props }: LinkButtonProps) {
  const ui = useUi()
  return <ui.LinkButton {...props} href={url ?? "#"} color={color} />
}

export interface ButtonGroupProps {
  /** `false` stacks the buttons vertically. Default `true`. */
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

/** `<x-forms::button-group>`. */
export function ButtonGroup({ inline = true, ...props }: ButtonGroupProps) {
  const ui = useUi()
  return <ui.ButtonGroup {...props} orientation={inline ? "horizontal" : "vertical"} />
}
