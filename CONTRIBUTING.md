# Contributing

Contributions are welcome via pull requests on [GitHub](https://github.com/Javaabu/react-forms).

- Follow the Blade component's API (see `docs/migrating-from-blade.md` for the mapping rules).
- Add tests for new behaviour and keep `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` and `pnpm build` passing.
- Update the docs page of the component you change.
- Describe the change with `pnpm changeset`.

## Releasing

Releases go out from `main` through `.github/workflows/release.yml` ([Changesets](https://github.com/changesets/changesets)):

1. Merge work with its changesets into `main`. The workflow opens (or updates) a **Version Packages** PR that bumps the version and writes `CHANGELOG.md`.
2. Merge that PR. The workflow runs `pnpm check`, publishes to npm with provenance, and tags `@javaabu/forms@<version>`.

The repository needs an `NPM_TOKEN` secret (an npm automation token with publish rights to `@javaabu`), and **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests** turned on.
