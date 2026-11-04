---
title: AI assistants
sidebar_position: 1.65
---

The docs are plain Markdown, written for people and AI coding assistants alike. The package ships them, so they always match the version you have installed.

| File | What |
| --- | --- |
| `node_modules/@javaabu/forms/llms.txt` | The rules for using the package, and an index of every page |
| `node_modules/@javaabu/forms/docs/` | The pages |
| `node_modules/@javaabu/forms/resources/boost/` | The Laravel Boost guideline and skill |

# Laravel Boost

[Laravel Boost](https://github.com/laravel/boost) finds the guideline and skill by itself when `@javaabu/forms` is a direct dependency in your `package.json`. Run this after installing or updating the package:

```bash
php artisan boost:update
```

Choose `@javaabu/forms` if Boost asks which third-party packages to use.

# Other assistants

Point your assistant at the docs from the project's instructions file (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, `.github/copilot-instructions.md`):

```md
## Forms

React forms use @javaabu/forms. Before writing a form, read node_modules/@javaabu/forms/llms.txt.
```

Or copy `node_modules/@javaabu/forms/resources/boost/skills/javaabu-react-forms` into your assistant's skills folder, such as `.claude/skills/`.
