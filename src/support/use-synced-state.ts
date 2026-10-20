import * as React from "react"

/**
 * State that starts from `initial` and resets to it whenever `key` changes
 * (e.g. the bound model arrives after the first render), using React's
 * "adjust state while rendering" pattern instead of an effect.
 */
export function useSyncedState<T>(initial: T, key: unknown = initial) {
  const [state, setState] = React.useState(initial)
  const [previousKey, setPreviousKey] = React.useState(key)
  if (!Object.is(previousKey, key)) {
    setPreviousKey(key)
    setState(initial)
  }
  return [state, setState] as const
}
