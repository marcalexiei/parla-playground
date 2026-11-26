# parla-playground

A pnpm monorepo that exercises [Parla](https://github.com/marcalexiei/parla) the way an app does:

- `apps/web`: React + Vite. `checkout` is MessageFormat 2, `account` is ICU and loads lazily.
- `packages/ui`: a workspace package that owns the shared `common` namespace (ICU).
- Locales `en` and `it` are complete; `de` is partial, so missing keys fall back to English.

Parla is not on npm yet: the `@parlajs/*` overrides in `pnpm-workspace.yaml` install the tarballs
that `pnpm pack:all` writes in a sibling `../parla` checkout.

```sh
pnpm parla:update   # pack ../parla and reinstall
pnpm dev            # the app on http://localhost:5173
pnpm typecheck      # parla types/build, then tsc in every package
pnpm check          # parla check, then x18n check
```

## x18n

[x18n](https://x18n.dev) reads the catalogs through `x18n.config.ts`. Two things need
`x18n-parla.ts`, a small plugin:

- **Usages**: x18n's scanner does not follow accessor chains yet, so the plugin finds
  `const t = useT('ns')` and every `t.a.b(params)` call in its scope.
- **Placeholders**: the plugin reads each message's params and markup with Parla's own ICU and
  MF2 parsers, so `param-mismatch` and `invalid-syntax` work for both formats.

Keys are written `ns:path.to.key`, since Parla's paths contain dots.
