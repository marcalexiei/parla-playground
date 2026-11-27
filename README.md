# parla-playground

A showcase of [Parla](https://github.com/marcalexiei/parla): one page per scenario, each with the
component and catalog that drive it.

| Page             | Shows                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Plurals          | Cardinals and ordinals in ICU and MF2, side by side                 |
| Select           | Params typed per branch                                             |
| Numbers & dates  | `Intl` formatting, and a custom `:relative` function                |
| Rich text        | Tags as React elements; default `markup` from the config            |
| Lazy namespaces  | Loaded in a route loader versus suspending in `useParla`            |
| Partial locales  | `de` falls back to English at build time                            |
| Typed props      | A child typed `Translations<typeof ns>`, fed a wider `t`            |
| Shared package   | `packages/ui` owns and builds `common`                              |
| Type errors      | Errors `tsc` really reports, pinned with `@ts-expect-error`         |

The header switches between `en`, `it`, `de` (partial) and `ar` (right to left). The bar below it
shows `setLocale` loading, adds a chunk delay, logs every chunk fetched and highlights what changed.

```sh
pnpm dev         # http://localhost:5173
pnpm typecheck   # parla build, then tsc, in each package
pnpm check       # parla check, then x18n check
pnpm lint        # oxlint, type-aware; lint:fix fixes what it can
pnpm format      # oxfmt; format:check only checks
pnpm build       # apps/web/dist, with a relative base for any Pages path
```

## Parla

Parla isn't on npm yet: `pnpm-workspace.yaml` installs the tarballs in `vendor/parla`, committed so
CI builds without a Parla checkout. They come from `feat/namespace-objects`.

```sh
pnpm parla:update                          # pack ../parla, copy to vendor/, reinstall
PARLA_DIR=../other-checkout pnpm parla:update
```

## GitHub Pages

`.github/workflows/pages.yml` checks, builds and deploys `apps/web/dist` on every push to `main`.
Before the first run, set **Settings → Pages → Source** to **GitHub Actions**. Routes live in the
hash, so the site works under `/<repo>/` without rewrites.

## x18n

[x18n](https://x18n.dev) checks catalogs and usages through `x18n-parla.ts`, which:

- reads each catalog under the namespace its `parla.config.ts` gives it;
- finds `t` from `const { t } = useParla([ns])` or a `{ t }: { t: Translations<typeof ns> }` prop,
  naming each `ns` by the `namespaces/<ns>.js` it is imported from;
- reads params and markup with Parla's own parsers, knowing the configs' `functions` and `markup`;
- leaves per-branch select params to TypeScript.

Keys are `ns:path.to.key`, since Parla's paths contain dots.
