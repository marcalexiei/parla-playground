# parla-playground

[Parla](https://github.com/marcalexiei/parla) used the way an app with shared packages does.

- `apps/web`: React + Vite; `checkout` is MF2, `account` is ICU and loads on first show.
- `packages/ui`: owns the shared `common` namespace.
- `de` is partial, so missing keys fall back to English.

Parla isn't on npm yet: `pnpm-workspace.yaml` installs the tarballs from a sibling `../parla`.

```sh
pnpm parla:update   # pack ../parla and reinstall
pnpm dev            # http://localhost:5173
pnpm typecheck      # parla build, then tsc everywhere
pnpm check          # parla check, then x18n check
```

## x18n

[x18n](https://x18n.dev) checks catalogs and usages through `x18n-parla.ts`, which:

- finds `const { t } = useParla(['ns'])` and every `t.ns.a.b()` in scope;
- reads params and markup with Parla's own ICU and MF2 parsers.

Keys are `ns:path.to.key`, since Parla's paths contain dots.
