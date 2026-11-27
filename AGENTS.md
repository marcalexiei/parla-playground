# AGENTS.md

Rules for agents in the [Parla](https://github.com/marcalexiei/parla) playground.

## Always

- **Run `pnpm typecheck`, `pnpm check`, `pnpm lint` and `pnpm format:check` before handing work over.**
- **Never hand-edit `src/parla/`**: `parla build` writes it, in `packages/ui` first.
- **Fix Parla bugs in `../parla`**, then `pnpm parla:update` (`PARLA_DIR=` for another checkout);
  never patch `node_modules`.
- **Keep text short**; cut what code or a table shows.

## Layout

| Path                |                                                         |
| ------------------- | ------------------------------------------------------- |
| `apps/web`          | Vite + React; a page per scenario, in `src/pages/<id>/` |
| `apps/web/src/lab`  | Locale-switch status, chunk delay and log, highlight    |
| `packages/ui`       | Shared components; owns and builds `common` (ICU)       |
| `vendor/parla`      | Parla tarballs, committed so CI needs no `../parla`     |
| `x18n.config.ts`    | [x18n](https://x18n.dev) checks                         |
| `x18n-parla.ts`     | x18n plugin: parla catalogs, accessors, placeholders    |
| `oxlint.config.ts`  | oxlint, type-aware: lint after `parla build`            |
| `.github/workflows` | `pages.yml` builds and deploys to GitHub Pages          |

- **Parla comes from `vendor/parla/*.tgz`**, via `pnpm-workspace.yaml` overrides.
- **Components get `t` from `useParla([ns])` or a `{ t }: { t: Translations<typeof ns> }` prop**,
  each `ns` imported from a `namespaces/<ns>.js` module: x18n reads nothing else.
- **A page's namespaces go in its route's `namespaces`** (`routes.ts`), so it never suspends.
- **Keys reach x18n as `ns:path.to.key`**.
- **After changing `x18n-parla.ts`, delete `node_modules/.cache/x18n`**: the cache ignores the plugin.
- **After `parla:update`, start Vite with `--force`**: its pre-bundle keeps the old Parla.

## Conventions

- **A comment states the reason**, in one line.
- **A commit is a one-line conventional subject**: no body, no co-author.
