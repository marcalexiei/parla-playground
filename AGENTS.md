# AGENTS.md

Guidance for Claude Code in this repository: the playground for
[Parla](https://github.com/marcalexiei/parla), a type-safe i18n library.

## Before you change anything

- **Run `pnpm typecheck` and `pnpm check` before handing work over.**
- **Never hand-edit `src/parla/`**: `parla build` writes it, and it is gitignored.
- **A Parla bug is fixed in `../parla`**, then pulled in with `pnpm parla:update`; never patch
  `node_modules`.

## What this is

A pnpm monorepo that uses Parla the way an app with shared packages would.

| Path                   | What it is                                                                      |
| ---------------------- | ------------------------------------------------------------------------------- |
| `apps/web`             | Vite + React app; owns `checkout` (MF2) and `account` (ICU)                     |
| `packages/ui`          | Shared components; owns `common` (ICU), declared in its `package.json`          |
| `x18n.config.ts`       | [x18n](https://x18n.dev) checks over every catalog and usage                    |
| `x18n-parla.ts`        | x18n plugin: Parla's accessor-chain scanner and its ICU/MF2 placeholders        |

- **Parla is installed from tarballs**: `pnpm-workspace.yaml` overrides `@parlajs/*` with
  `../parla/.packs/*.tgz`, so `../parla` must sit beside this repo.
- **Components use only Parla's two hooks, always with a list**: `useSuspenseParla(['ns'])`
  suspends, `useParla(['ns'])` returns `ready`; `t` is keyed by namespace (`t.ns.key()`).
  The x18n plugin recognises nothing else, so a third form silently escapes the checks.
- **Keys reach x18n as `ns:path.to.key`**: Parla's paths contain dots, so the namespace separator
  is `:`.

## Commands

```sh
pnpm dev            # the app on Vite
pnpm typecheck      # parla build, then tsc in every package and over the x18n files
pnpm check          # parla check, then x18n check
pnpm parla:update   # pack ../parla and reinstall
```

- **`x18n check --no-cache`** after changing `x18n-parla.ts`: x18n caches scans in
  `node_modules/.cache/x18n`.

## Conventions

- **A comment states the reason, never the behaviour**, usually in one line.
- **A commit is a one-line conventional subject** (`feat: …`), with no body and no co-author.
