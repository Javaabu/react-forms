/**
 * English strings. The first group mirrors javaabu/forms `lang/en/strings.php`;
 * placeholders use Laravel's `:name` style so translations can be copied across.
 */
export const en = {
  requiredText: "*",
  nothingSelected: "Nothing Selected",
  blank: "-",
  yes: "Yes",
  no: "No",
  tableArraySeparator: ", ",
  fileinputSelectFile: "Select file",
  fileinputUploadFile: "Upload file",
  fileinputChangeFile: "Change",
  fileinputRemoveFile: "Remove",
  fileinputNothingSelected: "No file selected.",
  imageinputSelectImage: "Click to select an image",
  latitude: "Latitude",
  longitude: "Longitude",
  radius: "Radius",
  metersAbbr: "m",
  kmAbbr: "km",
  boundary: "Boundary",
  fileHint: "Only :types files of max :size allowed.",
  imageHint: "Recommended :widthpx x :heightpx.",
  textListSeparator: ", ",
  textListSeparatorLastGlue: " and ",
  mapSearchString: "Search...",
  searchFormPlaceholder: "Search...",

  // File sizes (format_file_size)
  kb: "KB",
  mb: "MB",
  gb: "GB",

  // Component text from the Blade views
  bulkAction: "Bulk Action",
  apply: "Apply",
  filter: "Filter",
  export: "Export",
  clear: "Clear",
  selectAll: "Select All",
  selectRow: "Select :name",
  createNew: "Create New",
  noItemsTitle: "It's a bit lonely here.",
  noItemsMessage: "Let's create some new :model_type.",
  items: "items",
  pagination: "Pagination",
  previous: "Previous",
  next: "Next",
  sortBy: "Sort by :label",

  // js-utilities messages
  loading: "Loading...",
  errorLoadingOptions: "Error Loading Options",
  uploading: "Uploading...",
  removing: "Removing...",
  areYouSure: "Are you sure?",
  removeFileConfirm: "You will not be able to undo deleting this file!",
  removeFileConfirmButton: "Yes, remove it!",
  cancel: "Cancel",
  uploadError: "An error occurred while uploading the file.",
  removeError: "An error occurred while removing the file.",
  fileTooLarge: "File size cannot be greater than :size MB",
  fileTypeNotAllowed: "Only :accept files are allowed.",
  confirmText: "Just checking if you wanted to really do this.",
  confirmButton: "Yes, continue!",
  deleteConfirmText: "You will not be able to undo this delete operation!",
  deleteConfirmButton: "Yes, delete it!",
}

export type FormsMessages = { [K in keyof typeof en]: string }
