---
"@javaabu/forms": minor
---

A `<script>` tag build, `dist/forms.iife.js` (also the package's `unpkg`/`jsdelivr` file and `@javaabu/forms/browser`). It puts every component and the plain HTML adapter on `window.JavaabuForms`, with React, ReactDOM and `@javaabu/i18n` bundled in, plus `h` (`React.createElement`) and `mount(target, node, providerProps)`, so pages without a bundler can use the forms. `examples/script-tag.html` shows it in Dhivehi.
