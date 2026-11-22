import * as React from "react"

/** The values a form would submit natively. */
export const fd = (c: HTMLElement) => new FormData(c.querySelector("form")!)

/** A stand-in for Inertia's `useForm()`, enough for `<Form form={…}>`. `calls` records `transform` and `submit`. */
export function fakeUseForm(initial: Record<string, unknown>) {
  const calls = { transform: [] as unknown[], submit: [] as unknown[][], reset: [] as unknown[][] }
  const latest: { data: Record<string, unknown> } = { data: initial }
  function useFake() {
    const [data, setDataState] = React.useState(initial)
    latest.data = data
    return {
      data,
      setData: (u: (d: Record<string, unknown>) => Record<string, unknown>) => setDataState((d) => u(d)),
      errors: {},
      processing: false,
      progress: null,
      submit: (...a: unknown[]) => calls.submit.push(a),
      clearErrors: () => {},
      transform: (cb: unknown) => calls.transform.push(cb),
      reset: (...a: unknown[]) => calls.reset.push(a),
    }
  }
  return { useFake, calls, latest }
}
