/**
 * English strings. The first group mirrors javaabu/forms `lang/en/strings.php`;
 * placeholders use Laravel's `:name` style so translations can be copied across.
 */
export const en = {
  required_text: "*",
  nothing_selected: "Nothing Selected",
  blank: "-",
  yes: "Yes",
  no: "No",
  table_array_separator: ", ",
  fileinput_select_file: "Select file",
  fileinput_upload_file: "Upload file",
  fileinput_change_file: "Change",
  fileinput_remove_file: "Remove",
  fileinput_nothing_selected: "No file selected.",
  imageinput_select_image: "Click to select an image",
  latitude: "Latitude",
  longitude: "Longitude",
  radius: "Radius",
  meters_abbr: "m",
  km_abbr: "km",
  boundary: "Boundary",
  file_hint: "Only :types files of max :size allowed.",
  image_hint: "Recommended :widthpx x :heightpx.",
  text_list_separator: ", ",
  text_list_separator_last_glue: " and ",
  map_search_string: "Search...",
  search_form_placeholder: "Search...",

  // File sizes (format_file_size)
  kb: "KB",
  mb: "MB",
  gb: "GB",

  // Component text from the Blade views
  bulk_action: "Bulk Action",
  apply: "Apply",
  filter: "Filter",
  export: "Export",
  clear: "Clear",
  select_all: "Select All",
  select_row: "Select :name",
  create_new: "Create New",
  no_items_title: "It's a bit lonely here.",
  no_items_message: "Let's create some new :model_type.",
  items: "items",
  pagination: "Pagination",
  pagination_previous: "Previous",
  pagination_next: "Next",
  export_options: "More export options",
  sort_by: "Sort by :label",

  // js-utilities messages
  loading: "Loading...",
  error_loading_options: "Error Loading Options",
  uploading: "Uploading...",
  removing: "Removing...",
  are_you_sure: "Are you sure?",
  remove_file_confirm: "You will not be able to undo deleting this file!",
  remove_file_confirm_button: "Yes, remove it!",
  cancel: "Cancel",
  upload_error: "An error occurred while uploading the file.",
  remove_error: "An error occurred while removing the file.",
  file_too_large: "File size cannot be greater than :size MB",
  file_type_not_allowed: "Only :accept files are allowed.",
  confirm_text: "Just checking if you wanted to really do this.",
  confirm_button: "Yes, continue!",
  delete_confirm_text: "You will not be able to undo this delete operation!",
  delete_confirm_button: "Yes, delete it!",

  // Form errors
  error_summary_title: "Please correct the errors below.",
  submit_failed: "The form could not be submitted. Please try again.",
  close: "Close",
  page: "Page :page",
  search: "Search",
  add_option: 'Add ":value"',
  thaana_toggle: "Type in Thaana",
}

export type FormsMessages = { [K in keyof typeof en]: string }
