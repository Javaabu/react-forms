// Recommended usage mirrors Blade's `<x-forms::input>`:
//   import * as Forms from "@javaabu/react-forms"
//   <Forms.Form model={user}><Forms.Text name="name" /></Forms.Form>

// Configuration, binding and the field registry
export * from "./context/forms-provider"
export {
  Model,
  OldInput,
  useBoundModel,
  useOldInput,
  useFieldValue,
  getBoundValue,
  type ModelProps,
  type OldInputProps,
} from "./context/binding"
export { useWatchField, type WatchedField } from "./context/registry"
export { en, dv, type FormsMessages } from "./locales"

// Form scaffolding
export { Form, FormGroup, Label, LabelRequired, InputHelp, Errors } from "./components/form"
export type { FormProps, FormGroupProps, LabelProps, ErrorsProps } from "./components/form"
export { FieldWrapper, useFieldNames, type FieldProps, type PlaceholderProps } from "./components/field"
export { Button, Submit, LinkButton, ButtonGroup, colorToVariant } from "./components/buttons"
export type { ButtonProps, ButtonColor, LinkButtonProps, ButtonGroupProps } from "./components/buttons"

// Inputs
export { Input, Text, Email, Password, Number, Tel, Url, Hidden, Latitude, Longitude } from "./components/inputs"
export type { InputProps, NumberProps, HiddenProps } from "./components/inputs"
export { Textarea, type TextareaProps } from "./components/textarea"
export { Checkbox, Radio, type CheckboxProps, type RadioProps } from "./components/checkbox"
export { Date, Datetime, Time, type DateProps, type DatetimeProps, type TimeProps } from "./components/dates"
export { Select, Select2, type SelectProps, type Select2Props } from "./components/select"
export { File, FileUpload, Image, ImageUpload, type FileProps, type ImageProps } from "./components/files"

// Display
export {
  Alert,
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardFooter,
  Accordion,
  AccordionItem,
  Tabs,
  TabsPane,
  NavTabs,
  Modal,
  Status,
  ConditionalLink,
  ConditionalWrapper,
  TextEntry,
  BooleanEntry,
  Infolist,
} from "./components/display"
export type {
  AlertProps,
  CardProps,
  AccordionProps,
  AccordionItemProps,
  AccordionItemData,
  TabsProps,
  TabData,
  TabsPaneProps,
  NavTabsProps,
  NavTabData,
  ModalProps,
  StatusProps,
  ConditionalLinkProps,
  ConditionalWrapperProps,
  TextEntryProps,
  InfolistProps,
} from "./components/display"
export { FormattedValue, type FormattedValueProps } from "./components/format"

// Listing pages
export {
  Table,
  TableRow,
  TableCell,
  TableHeading,
  TableEmptyRow,
  BulkActions,
  Filter,
  FilterSubmit,
  PerPage,
  SearchForm,
  NoItems,
  Pagination,
} from "./components/listing"
export type {
  TableProps,
  TableRowProps,
  TableCellProps,
  TableHeadingProps,
  TableEmptyRowProps,
  BulkActionsProps,
  FilterSubmitProps,
  PerPageProps,
  SearchFormProps,
  NoItemsProps,
  PaginationProps,
} from "./components/listing"

// Helpers
export { nameToId, nameToLabel, bracketsToDots } from "./support/str"
export { dataGet } from "./support/data"
export { normalizeOptions, type OptionsInput } from "./support/options"
export { parseDateValue } from "./support/dates"
export {
  ALLOWED_MIME_TYPES,
  registerMimeTypes,
  registerMimeTypeExtensions,
  getAllowedMimeTypes,
  getExtensions,
  getMaxFileSize,
  formatFileSize,
} from "./support/mime-types"
