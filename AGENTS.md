# AGENTS.md

Rules for agents in the [Parla](https://github.com/marcalexiei/parla) playground.

## Always

- **Run `pnpm typecheck` and `pnpm check` before handing work over.**
- **Never hand-edit `src/parla/`**: `parla build` writes it.
- **Fix Parla bugs in `../parla`**, then `pnpm parla:update`; never patch `node_modules`.
- **Keep text short**; cut what code or a table shows.

## Layout

| Path             |                                                     |
| ---------------- | --------------------------------------------------- |
| `apps/web`       | Vite + React; owns `checkout` (MF2), `account` (ICU) |
| `packages/ui`    | Shared components; owns `common` (ICU)              |
| `x18n.config.ts` | [x18n](https://x18n.dev) checks                     |
| `x18n-parla.ts`  | x18n plugin: accessor scanner, ICU/MF2 placeholders |

- **Parla comes from `../parla/.packs/*.tgz`**, via `pnpm-workspace.yaml` overrides.
- **Components get `t` only from `useParla(['ns'])`**: x18n reads nothing else.
- **Keys reach x18n as `ns:path.to.key`**.
- **After changing `x18n-parla.ts`, run `x18n check --no-cache`.**
- **After `parla:update`, start Vite with `--force`**: its pre-bundle keeps the old Parla.

## Conventions

- **A comment states the reason**, in one line.
- **A commit is a one-line conventional subject**: no body, no co-author.
