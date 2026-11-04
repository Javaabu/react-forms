---
title: shadcn/ui
sidebar_position: 1.5
---

shadcn/ui components live in your app (`components/ui`), so the adapter is made from them: pass the components you have to `createShadcnAdapter()`. Slots whose components you haven't added render with the plain HTML adapter, so you can start with a few and add more later.

# Setup

Add the components (any subset works):

```bash
npx shadcn@latest add button input textarea label field checkbox radio-group select popover command card alert badge table tabs accordion dialog dropdown-menu
```

Make the adapter once:

```tsx
// resources/js/lib/forms.ts
import { createShadcnAdapter } from "@javaabu/forms/shadcn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export const ui = createShadcnAdapter({
  Button, Input, Textarea, Label, Field, FieldDescription, FieldError, FieldLabel, Checkbox, RadioGroup, RadioGroupItem,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Popover, PopoverContent, PopoverTrigger, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Alert, AlertDescription, AlertTitle, Badge,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger,
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
})
```

And use it:

```tsx
import { FormsProvider } from "@javaabu/forms"
import { ui } from "@/lib/forms"

<FormsProvider ui={ui}>{children}</FormsProvider>
```

Tailwind must see the package's classes too: add `@source "../../node_modules/@javaabu/forms/dist";` (adjust the path) to your CSS.

# Which components make which slots

| shadcn components | Slots |
| --- | --- |
| `Button` | `Button`, `LinkButton` (with `asChild`) |
| `Input` | `Input`, `Number`, `Date` (native date / time inputs), `File` |
| `Textarea` | `Textarea` |
| `Label` | `Label`, and the labels beside checkboxes and radios |
| `Field`, `FieldLabel`, `FieldDescription`, `FieldError` | `Field`. With only `Label`, a simple layout is used |
| `Checkbox` | `Checkbox` |
| `RadioGroup`, `RadioGroupItem` | `Radio` |
| `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` | `Select` without search |
| `Popover`, `PopoverTrigger`, `PopoverContent`, `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem` | `Select` with search, multiple values, tags or server search (the shadcn combobox) |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `Card` and its parts |
| `Alert`, `AlertTitle`, `AlertDescription` | `Alert`, `ErrorSummary` |
| `Badge` | `Status` |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | Table slots |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `Tabs` |
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | `Accordion` |
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` | `Modal` |
| `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` | `ActionMenu` |

`Form`, `DescriptionList`, `DescriptionItem` and `EmptyState` are always included, built from Tailwind utilities and shadcn's theme tokens. Not covered by shadcn, so plain HTML (style them by `data-slot`): `Image`, `Wysiwyg`, `Map`, `Pagination`, `NavTabs`, `ErrorSummary` without `Alert`. Replace any of them with your own components through `components` (see [UI adapters](./adapters)).

# Notes

- Blade colours map to shadcn variants: `primary` → `default`, `danger` → `destructive`, `secondary`/`dark` → `secondary`, `light` and `outline-*` → `outline`, `link` → `link`. `Status` tones map to `Badge` variants.
- Radix's select can't hold an empty value, so the placeholder shows instead; a select without search can't be cleared once picked. Use `Select2` (the combobox) when the field is optional and must be clearable.
- Each radio is its own Radix group, so arrow keys don't move between radios of a group; `Tab` and `Space` do.
- Thaana typing works on `Input` and `Textarea` with `thaana`.
- `confirm` and `notify` (for file uploads) use `window.confirm` / `alert` unless you pass yours: `createShadcnAdapter(components, { notify: (message) => toast(message) })`, e.g. with sonner.
- The adapter is tested with the [conformance kit](./adapters#testing-an-adapter) against stock shadcn/ui (new-york-v4) components.
