import * as React from "react"
import { createRoot } from "react-dom/client"
import { OnuProvider, ThemeProvider } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

import * as Forms from "../../src"
import "./styles.css"

const article = {
  title: "Harbour works update",
  slug: "harbour-works-update",
  body: "First line\nSecond line",
  status: "draft",
  category: { id: 2, name: "News" },
  tags: [{ id: 1 }, { id: 3 }],
  published_at: "2026-10-01 09:30:00",
  is_featured: true,
  channels: ["email"],
  type: "quiz",
  views: 1250,
  media: [{ collection_name: "attachment", original_url: "/storage/1/report.pdf", file_name: "report.pdf" }],
}

const users = [
  {
    id: 1,
    name: "Aishath Ali",
    email: "aishath@example.com",
    active: true,
    role: { value: "admin", label: "Admin", color: "success" },
  },
  {
    id: 2,
    name: "Ibrahim Hassan",
    email: "ibrahim@example.com",
    active: false,
    role: { value: "editor", label: "Editor", color: "warning" },
  },
]

function App() {
  const [rtl, setRtl] = React.useState(new URLSearchParams(location.search).has("dv"))
  return (
    <ThemeProvider>
      <OnuProvider locale={rtl ? dv : undefined}>
        <Forms.FormsProvider settings={{ max_upload_file_size: 10240, max_image_file_size: 2048 }}>
          <main className="mx-auto max-w-4xl gap-8 p-6 grid">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">@javaabu/react-forms</h1>
              <Forms.Button color="light" onClick={() => setRtl((v) => !v)}>
                {rtl ? "English" : "ދިވެހި"}
              </Forms.Button>
            </div>

            <Forms.Alert type="success" heading="Saved" dismissible>
              Your changes have been saved.
            </Forms.Alert>

            <Forms.Card title="Edit article">
              <Forms.Form
                method="PATCH"
                action="/articles/1"
                model={article}
                files
                errors={{ slug: "The slug has already been taken." }}
                onSubmit={(values) => new Promise((resolve) => setTimeout(() => resolve(values), 800))}
              >
                <Forms.Text name="title" required thaana />
                <Forms.Text name="slug" help="Used in the article's URL." />
                <Forms.Textarea name="body" rows={3} />
                <Forms.Select name="status" options={{ draft: "Draft", published: "Published" }} />
                <Forms.Select2
                  name="category"
                  relation
                  options={[
                    { id: 1, name: "Events" },
                    { id: 2, name: "News" },
                  ]}
                />
                <Forms.Select2 name="tags[]" multiple options={{ 1: "Harbour", 2: "Weather", 3: "Transport" }} />
                <Forms.Datetime name="published_at" />
                <Forms.Number name="views" />
                <Forms.Checkbox name="is_featured" />
                <Forms.Checkbox name="channels[]" value="email" label="Email" />
                <Forms.Checkbox name="channels[]" value="sms" label="SMS" />
                <Forms.Radio name="type" value="quiz" label="Quiz" />
                <Forms.Radio name="type" value="video" label="Video" />
                <Forms.ConditionalWrapper enableElem="type" enableValue="quiz" hideFields>
                  <Forms.Date name="expires_at" />
                </Forms.ConditionalWrapper>
                <Forms.File name="attachment" />
                <Forms.Image name="cover" width={800} height={450} />
                <Forms.Text name="company_name" inline label="Inline label" />
                <Forms.Submit>Save</Forms.Submit>
              </Forms.Form>
            </Forms.Card>

            <Forms.Infolist title="Article" model={article}>
              <Forms.TextEntry name="title" />
              <Forms.TextEntry name="body" multiline />
              <Forms.BooleanEntry name="is_featured" />
              <Forms.TextEntry name="channels" />
            </Forms.Infolist>

            <Forms.Table
              model="users"
              noBulk
              headers={
                <>
                  <Forms.TableHeading label="Name" sortable="name" />
                  <Forms.TableHeading label="Email" />
                  <Forms.TableHeading label="Active" />
                  <Forms.TableHeading label="Role" />
                </>
              }
            >
              {users.map((user) => (
                <Forms.TableRow key={user.id} model={user}>
                  <Forms.TableCell name="name" />
                  <Forms.TableCell name="email" />
                  <Forms.TableCell name="active" />
                  <Forms.TableCell name="role" />
                </Forms.TableRow>
              ))}
            </Forms.Table>

            <Forms.Tabs
              tabs={[{ name: "home" }, { name: "profile", title: "Profile" }, { name: "contact", disabled: true }]}
              active="profile"
            >
              <Forms.TabsPane name="home">Home content</Forms.TabsPane>
              <Forms.TabsPane name="profile">Profile content</Forms.TabsPane>
            </Forms.Tabs>

            <Forms.NoItems modelType="users" showCreate createAction="/users/create" />
          </main>
        </Forms.FormsProvider>
      </OnuProvider>
    </ThemeProvider>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
