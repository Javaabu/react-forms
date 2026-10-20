"use client"

import * as React from "react"

import { bracketsToDots } from "../support/str"
import { dataGet, dataHas, isNil } from "../support/data"
import { useFormsConfig } from "./forms-provider"

/**
 * A field's `model` prop: an object to read values from, `false` to ignore the
 * surrounding binding, or `undefined` to use it.
 */
export type ModelProp = unknown

const ModelContext = React.createContext<unknown>(undefined)
const OldInputContext = React.createContext<Record<string, unknown> | null | undefined>(undefined)

export interface ModelProps {
  /** The model (or any object) fields inside read their values from. */
  model: unknown
  children?: React.ReactNode
}

/**
 * Binds a model for the fields inside, like Blade's `@model($video) … @endmodel`.
 * Nested bindings win; a field's own `model` prop wins over both.
 */
export function Model({ model, children }: ModelProps) {
  return <ModelContext.Provider value={model}>{children}</ModelContext.Provider>
}

/** The nearest bound model, or `undefined`. */
export function useBoundModel(): unknown {
  return React.useContext(ModelContext)
}

export interface OldInputProps {
  /** Old input (flashed request data), keyed like the request: `{ address: { city: "Malé" } }`. */
  old: Record<string, unknown> | null | undefined
  children?: React.ReactNode
}

/** Provides old input to the fields inside. `Form` renders this for its `old` prop. */
export function OldInput({ old, children }: OldInputProps) {
  return <OldInputContext.Provider value={old}>{children}</OldInputContext.Provider>
}

export interface OldInputAccess {
  /** `session()->hasOldInput()`. */
  has: boolean
  /** `old($name)`; `undefined` when the key is missing. */
  get: (name: string) => unknown
  /** True when old input has the key, even with a `null` value. */
  hasKey: (name: string) => boolean
}

/** Old input from the nearest `Form` / `OldInput`, falling back to `FormsProvider old`. */
export function useOldInput(): OldInputAccess {
  const local = React.useContext(OldInputContext)
  const { old: global } = useFormsConfig()
  const old = local === undefined ? global : local
  return React.useMemo(() => {
    const has = !!old && Object.keys(old).length > 0
    return {
      has,
      get: (name) => (has ? dataGet(old, bracketsToDots(name)) : undefined),
      hasKey: (name) => has && dataHas(old, bracketsToDots(name)),
    }
  }, [old])
}

/** Resolves the target a field reads from: its own `model`, `false` for none, or the bound model. */
export function useBindTarget(model: ModelProp): unknown {
  const bound = useBoundModel()
  if (model === false) return undefined
  return isNil(model) ? bound : model
}

/** `getBoundValue`: the value at `name` (bracket or dot notation) on the bind target. */
export function getBoundValue(target: unknown, name: string): unknown {
  if (isNil(target) || !name) return undefined
  return dataGet(target, bracketsToDots(name))
}

/**
 * The value precedence of javaabu/forms (`HandlesDefaultAndOldValue`):
 * old input → bound value → `default`.
 */
export function useFieldValue(name: string, model: ModelProp, fallback: unknown): unknown {
  const target = useBindTarget(model)
  const old = useOldInput()
  const bound = getBoundValue(target, name)
  const value = isNil(bound) ? fallback : bound
  return old.hasKey(name) ? old.get(name) : value
}
