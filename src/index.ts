// Recommended usage mirrors Blade's `<x-forms::input>`:
//   import * as Forms from "@javaabu/forms"
//   <Forms.Form model={user}><Forms.Text name="name" /></Forms.Form>

// Configuration and adapters
export {
  FormsProvider,
  useFormsConfig,
  useUi,
  useFormsServices,
  useSetting,
  useCsrfToken,
  DEFAULT_SETTINGS,
  type FormsProviderProps,
  type FormsConfig,
  type Authorize,
  type FormsSettings,
} from "./core/provider"
export * from "./core/adapter"
export { useFormsTranslation, STRINGS_PREFIX, type FormsMessageKey } from "./core/strings"
export { en, dv, type FormsMessages } from "./core/locales"
export { thaanaKeyDown, toThaana, THAANA_KEYMAP } from "./core/thaana"
export { useRemoteOptions, type RemoteOptionsState } from "./core/remote"
export { TabPanel, useReveal, type TabPanelProps } from "./core/reveal"

// Binding, errors, routing
export {
  Model,
  OldInput,
  useBoundModel,
  useOldInput,
  useFieldValue,
  getBoundValue,
  type ModelProps,
  type OldInputProps,
} from "./core/binding"
export {
  ValidationError,
  getValidationErrors,
  readValidationErrors,
  errorsFor,
  selectErrorBag,
  toDotNotation,
  focusFirstInvalid,
  type FormErrors,
  type PageErrors,
  type ValidationPayload,
} from "./core/errors"
export { useFormState, useFieldErrors, type FormState, type FormStatus } from "./core/form-context"
export {
  fetchRouter,
  resolveAction,
  formDataToObject,
  type FormsRouter,
  type FormAction,
  type RouteDefinition,
  type RouteFormDefinition,
  type SubmitRequest,
  type SubmitCallbacks,
  type VisitOptions,
  type HttpMethod,
  type FormValues,
} from "./core/router"
export { useWatchField, usePublishField, type WatchedField, type FieldEntry, type FieldKind } from "./core/registry"

// Form scaffolding
export {
  Form,
  ErrorSummary,
  FormGroup,
  Label,
  LabelRequired,
  InputHelp,
  Errors,
  useFormStatus,
} from "./components/form"
export type {
  FormProps,
  InertiaFormLike,
  FormSubmitHandler,
  ErrorSummaryProps,
  FormGroupProps,
  LabelProps,
  ErrorsProps,
} from "./components/form"
export {
  useField,
  useFieldNames,
  useFieldState,
  splitFieldProps,
  type FieldProps,
  type PlaceholderProps,
  type UseFieldOptions,
  type FieldStateOptions,
} from "./components/field"
export { Button, Submit, LinkButton, ButtonGroup } from "./components/buttons"
export { Icon, type IconProps } from "./components/icon"
export type { ButtonProps, LinkButtonProps, ButtonGroupProps } from "./components/buttons"

// Inputs
export { Input, Text, Email, Password, Number, Tel, Url, Hidden, Latitude, Longitude } from "./components/inputs"
export type { InputProps, NumberProps, HiddenProps } from "./components/inputs"
export { Textarea, type TextareaProps } from "./components/textarea"
export { Wysiwyg, type WysiwygProps } from "./components/wysiwyg"
export { Checkbox, Radio, type CheckboxProps, type RadioProps } from "./components/checkbox"
export { Date, Datetime, Time, type DateProps, type DatetimeProps, type TimeProps } from "./components/dates"
export { Select, Select2, type SelectProps, type Select2Props } from "./components/select"
export { File, FileUpload, Image, ImageUpload, type FileProps, type ImageProps } from "./components/files"
export { MapInput, type MapInputProps } from "./components/map-input"

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
export { FormattedValue, colorToTone, type FormattedValueProps } from "./components/format"

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
  useTableSelection,
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
  LaravelPaginationMeta,
  LaravelResourceCollection,
  TableSelection,
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
