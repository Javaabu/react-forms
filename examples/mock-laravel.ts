import type { IncomingMessage, ServerResponse } from "node:http"
import type { Plugin } from "vite"

/**
 * A stand-in for a Laravel app, so the Inertia and fetch examples can submit:
 * `POST /demo/users/1` validates like a FormRequest and answers with Inertia pages
 * (`X-Inertia`) or JSON (422 with `{ message, errors }`).
 */
async function formData(req: IncomingMessage): Promise<FormData> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const body = Buffer.concat(chunks)
  const type = req.headers["content-type"] ?? ""
  if (type.includes("application/json")) {
    const data = new FormData()
    for (const [k, v] of Object.entries(JSON.parse(body.toString() || "{}") as Record<string, unknown>)) {
      if (Array.isArray(v)) v.forEach((item) => data.append(`${k}[]`, String(item)))
      else if (v !== null && typeof v === "object")
        for (const [k2, v2] of Object.entries(v)) data.append(`${k}[${k2}]`, String(v2))
      else data.append(k, v === null || v === undefined ? "" : String(v))
    }
    return data
  }
  return new Response(body, { headers: { "content-type": type } }).formData()
}

export const user = {
  id: 1,
  name: "ޢާއިޝަތު ޢަލީ",
  email: "aishath@example.com",
  address: { city: "މާލެ" },
  channels: ["email"],
}

function validate(data: FormData): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  if (!String(data.get("name") ?? "").trim()) errors.name = ["ނަން ލިޔުއްވާ. (The name field is required.)"]
  const email = String(data.get("email") ?? "")
  if (!email.includes("@")) errors.email = ["The email field must be a valid email address."]
  if (!String(data.get("address[city]") ?? data.get("address.city") ?? "").trim())
    errors["address.city"] = ["The city field is required."]
  return errors
}

function send(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  res.writeHead(status, { "content-type": "application/json", ...headers })
  res.end(JSON.stringify(body))
}

export function mockLaravel(): Plugin {
  const handle = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith("/demo/users/1") || req.method !== "POST") return next()
    const data = await formData(req)
    const errors = validate(data)
    const saved = Object.keys(errors).length === 0
    if (req.headers["x-inertia"]) {
      // Laravel redirects back; the page comes back with errors, or with the saved user.
      const props = {
        errors,
        flash: saved ? "ސޭވްކުރެވިއްޖެ. (Saved.)" : null,
        user: saved ? { ...user, name: data.get("name"), email: data.get("email") } : user,
      }
      return send(
        res,
        200,
        { component: "Users/Edit", props, url: "/inertia.html", version: null },
        { "x-inertia": "true", vary: "X-Inertia" },
      )
    }
    if (!saved) return send(res, 422, { message: "The given data was invalid.", errors })
    return send(res, 200, { message: "ސޭވްކުރެވިއްޖެ. (Saved.)" })
  }
  return {
    name: "mock-laravel",
    configureServer(server) {
      server.middlewares.use((req, res, next) => void handle(req, res, next))
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => void handle(req, res, next))
    },
  }
}
