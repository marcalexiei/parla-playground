// x18n's JS scanner does not read accessor chains yet, so Parla's `t.cart.items()` needs its own.
import { compileMessage, defaultFormats, loadConfig, ModuleScope } from '@parlajs/compiler';
import type { ResolvedConfig } from '@parlajs/compiler';
import { definePlugin } from '@x18n/cli';
import type { Plugin, Scanner } from '@x18n/cli';
import { parseSync, Visitor } from 'oxc-parser';

type Usage = Awaited<ReturnType<Scanner['scan']>>['usages'][number];

type PlaceholderSyntax = NonNullable<Plugin['placeholders']>[number];
type Placeholder = ReturnType<PlaceholderSyntax['find']>[number];

type Node = { type: string; start: number; end: number } & Record<string, unknown>;

type LocaleFinder = NonNullable<Plugin['localeFinders']>[number];

/** `file` relative to `root`, as x18n names resources. */
const relative = (root: string, file: string): string =>
  file.startsWith(`${root}/`) ? file.slice(root.length + 1) : file;

interface ParlaOptions {
  /** Hooks that take a namespace or a list and return `{ t }`. Default: Parla's two React hooks. */
  readonly callees?: readonly string[];
  /** Parla configs whose namespaces x18n reads, relative to the root. Default: every `parla.config.ts`. */
  readonly configs?: readonly string[];
}

const isNode = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && typeof (value as Node).type === 'string';

/** `t.cart.items` → `{ root: 't', segments: ['cart', 'items'] }`; undefined for computed or non-member chains. */
function memberChain(node: Node): { root: Node; segments: Array<Node> } | undefined {
  const segments: Array<Node> = [];
  let current: unknown = node;
  while (isNode(current) && current.type === 'MemberExpression') {
    if (current['computed'] || !isNode(current['property'])) {
      return undefined;
    }
    segments.unshift(current['property']);
    current = current['object'];
  }
  if (!isNode(current) || current.type !== 'Identifier' || segments.length === 0) {
    return undefined;
  }
  return { root: current, segments };
}

/** Names of an object literal's keys, or undefined when a spread or computed key hides some. */
function staticKeys(node: unknown): Array<string> | undefined {
  if (!isNode(node) || node.type !== 'ObjectExpression') {
    return undefined;
  }
  const keys: Array<string> = [];
  for (const property of node['properties'] as Array<Node>) {
    const key = property['key'];
    if (property.type !== 'Property' || property['computed'] || !isNode(key)) {
      return undefined;
    }
    if (key.type === 'Identifier') {
      keys.push(key['name'] as string);
    } else if (key.type === 'Literal') {
      keys.push(String(key['value']));
    }
  }
  return keys;
}

/** A `const { t } = useParla([a, b])`, visible inside `scope`; `t` is keyed by namespace. */
interface Binding {
  readonly name: string;
  readonly namespaces: ReadonlyArray<string>;
  readonly scope: Node;
}

const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

const stringValue = (node: unknown): string | undefined =>
  isNode(node) && node.type === 'Literal' && typeof node['value'] === 'string'
    ? node['value']
    : undefined;

// Parla writes each namespace to `namespaces/<name>.js`, so the path names it whatever the binding.
const NAMESPACE_MODULE = /\/namespaces\/([^/]+)\.js$/;

/** Local names of the namespace objects a file imports, to their namespace. */
function namespaceImports(program: Node): Map<string, string> {
  const out = new Map<string, string>();
  for (const statement of program['body'] as Array<Node>) {
    const name =
      statement.type === 'ImportDeclaration'
        ? stringValue(statement['source'])?.match(NAMESPACE_MODULE)?.[1]
        : undefined;
    for (const specifier of name ? (statement['specifiers'] as Array<Node>) : []) {
      const local = specifier['local'];
      if (specifier.type === 'ImportSpecifier' && isNode(local)) {
        out.set(local['name'] as string, name as string);
      }
    }
  }
  return out;
}

/** `[a, b]`; undefined unless every element is an imported namespace object. */
function namespacesOf(arg: unknown, imports: ReadonlyMap<string, string>): Array<string> | undefined {
  if (!isNode(arg) || arg.type !== 'ArrayExpression') {
    return undefined;
  }
  const namespaces = (arg['elements'] as Array<unknown>).map((element) =>
    isNode(element) && element.type === 'Identifier' ? imports.get(element['name'] as string) : undefined,
  );
  return namespaces.every((ns) => ns !== undefined) ? (namespaces as Array<string>) : undefined;
}

/** The local name `t` is bound to in `{ t }` or `{ t: alias }`. */
function tName(pattern: Node): string | undefined {
  for (const property of pattern['properties'] as Array<Node>) {
    const key = property['key'];
    const value = property['value'];
    if (
      property.type === 'Property' &&
      isNode(key) &&
      key['name'] === 't' &&
      isNode(value) &&
      value.type === 'Identifier'
    ) {
      return value['name'] as string;
    }
  }
  return undefined;
}

function collectBindings(
  node: Node,
  scope: Node,
  callees: ReadonlySet<string>,
  imports: ReadonlyMap<string, string>,
  out: Array<Binding>,
): void {
  const inner = FUNCTIONS.has(node.type) ? node : scope;
  if (node.type === 'VariableDeclarator') {
    const init = node['init'];
    const id = node['id'];
    if (isNode(init) && init.type === 'CallExpression' && isNode(id) && id.type === 'ObjectPattern') {
      const callee = init['callee'];
      const [arg] = init['arguments'] as Array<Node>;
      const name = tName(id);
      const namespaces = namespacesOf(arg, imports);
      if (
        isNode(callee) &&
        callee.type === 'Identifier' &&
        callees.has(callee['name'] as string) &&
        name !== undefined &&
        namespaces
      ) {
        out.push({ name, namespaces, scope: inner });
      }
    }
  }
  for (const value of Object.values(node)) {
    for (const child of Array.isArray(value) ? value : [value]) {
      if (isNode(child)) {
        collectBindings(child, inner, callees, imports, out);
      }
    }
  }
}

/** The innermost binding of `name` whose scope holds `position`. */
function resolve(
  bindings: ReadonlyArray<Binding>,
  name: string,
  position: number,
): Binding | undefined {
  let best: Binding | undefined;
  for (const binding of bindings) {
    const { scope } = binding;
    if (binding.name === name && scope.start <= position && position < scope.end) {
      if (!best || scope.end - scope.start < best.scope.end - best.scope.start) {
        best = binding;
      }
    }
  }
  return best;
}

function accessorScanner(callees: ReadonlySet<string>): Scanner {
  return {
    id: 'parla:accessor',
    extensions: ['js', 'jsx', 'mjs', 'ts', 'tsx', 'mts'],
    scan(file) {
      const { program } = parseSync(file.path, file.text);
      const bindings: Array<Binding> = [];
      const root = program as unknown as Node;
      collectBindings(root, root, callees, namespaceImports(root), bindings);
      const usages: Array<Usage> = [];

      new Visitor({
        CallExpression(expression) {
          const call = expression as unknown as Node;
          const callee = call['callee'];
          if (!isNode(callee)) {
            return;
          }
          const chain = memberChain(callee);
          const binding = chain && resolve(bindings, chain.root['name'] as string, call.start);
          if (!chain || !binding) {
            return;
          }
          // `t` is keyed by namespace: `t.checkout.title()`.
          const [head, ...segments] = chain.segments;
          const namespace = head?.['name'] as string | undefined;
          const first = segments[0];
          const last = segments.at(-1);
          if (namespace === undefined || !binding.namespaces.includes(namespace) || !first || !last) {
            return;
          }
          const [params] = call['arguments'] as Array<Node>;
          usages.push({
            raw: segments.map((segment) => segment['name'] as string).join('.'),
            range: { start: first.start, end: last.end },
            expression: { start: call.start, end: call.end },
            params: params ? staticKeys(params) : [],
            kind: 'accessor',
            dynamic: false,
            namespace,
          });
        },
      }).visit(program);

      return { usages };
    },
  };
}

// A namespace's format is in parla's config, which a placeholder syntax never sees: only MF2
// writes `{$name}` or starts with a declaration, and ICU is tried first for the rest.
const MF2_ONLY = /\{\s*\$|^\s*\.(?:input|local|match)\b/;

/** Params and markup a message reads, through parla's own parsers. Throws on invalid syntax. */
function messageNames(value: string): Array<string> {
  const formats = MF2_ONLY.test(value) ? ['mf2'] : ['icu', 'mf2'];
  let firstError: unknown;
  for (const id of formats) {
    const format = defaultFormats[id];
    if (!format) {
      continue;
    }
    try {
      const { info } = compileMessage(format.parse(value), new ModuleScope());
      return [...new Set([...info.params.keys(), ...info.markup])];
    } catch (error) {
      firstError ??= error;
    }
  }
  throw firstError;
}

const parlaPlaceholders: PlaceholderSyntax = {
  id: 'parla',
  example: '{name}',
  find(value) {
    let names: Array<string>;
    try {
      names = messageNames(value);
    } catch {
      return [];
    }
    return names.map((name): Placeholder => {
      const start = Math.max(value.indexOf(name), 0);
      return { syntax: 'parla', text: name, name, range: { start, end: start + name.length } };
    });
  },
  validate(value) {
    try {
      messageNames(value);
      return [];
    } catch (error) {
      return [(error as Error).message];
    }
  },
};

/**
 * Each catalog file under the namespace its parla config gives it, so `scopeAudit` may live in
 * `scope_audit.json`; `pre`, so these names win over a `resources` pattern matching the same file.
 */
function configFinder(configs: readonly string[] | undefined): LocaleFinder {
  let loaded: Promise<Array<ResolvedConfig>> | undefined;
  const load = async (root: string, glob: () => Promise<Array<string>>): Promise<Array<ResolvedConfig>> => {
    loaded ??= (async () => {
      const files = configs ?? (await glob());
      return Promise.all(files.map(async (file) => loadConfig(root, file)));
    })();
    return loaded;
  };
  let resolved: Array<ResolvedConfig> = [];
  return {
    id: 'parla:configs',
    async find({ host }) {
      resolved = await load(host.root, async () =>
        host.glob(['**/parla.config.ts'], { ignore: ['**/node_modules/**'], gitignore: true }),
      );
      return resolved.flatMap((config) =>
        config.namespaces.flatMap((ns) =>
          config.locales.map((locale) => ({
            path: relative(host.root, ns.file(locale)),
            locale,
            namespace: ns.name,
          })),
        ),
      );
    },
    resolveNew({ locale, namespace }, { host }) {
      for (const config of resolved) {
        const ns = config.namespaces.find((n) => n.name === namespace);
        if (ns && config.locales.includes(locale)) {
          return relative(host.root, ns.file(locale));
        }
      }
      return undefined;
    },
  };
}

export const parla = definePlugin((options: ParlaOptions = {}) => ({
  name: 'parla',
  enforce: 'pre' as const,
  runtime: 'node' as const,
  localeFinders: [configFinder(options.configs)],
  scanners: [accessorScanner(new Set(options.callees ?? ['useParla']))],
  placeholders: [parlaPlaceholders],
}));
