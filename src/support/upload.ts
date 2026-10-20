/**
 * Sends one field to the form's own action, like js-utilities' `fileUploadInput`:
 * `POST` to `action` with `_method` for `PUT`/`PATCH`/`DELETE` forms. Rejects with
 * the `Response` on an HTTP error, so `readValidationErrors` can read a 422.
 */
export async function submitFieldToForm(
  form: HTMLFormElement,
  name: string,
  value: File | string,
  csrfToken?: string | null,
): Promise<unknown> {
  const url = form.getAttribute("action") || window.location.href
  const spoofed = form.querySelector<HTMLInputElement>('input[name="_method"]')?.value
  const method = (spoofed || form.getAttribute("method") || "POST").toUpperCase()

  const data = new FormData()
  data.append(name, value)
  if (method !== "POST") data.append("_method", method)
  const token = csrfToken ?? form.querySelector<HTMLInputElement>('input[name="_token"]')?.value
  if (token) data.append("_token", token)

  const response = await fetch(url, {
    method: "POST",
    body: data,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(token ? { "X-CSRF-TOKEN": token } : {}),
    },
  })
  if (!response.ok) throw response
  const type = response.headers.get("content-type") ?? ""
  return type.includes("json") ? response.json() : response.text()
}
