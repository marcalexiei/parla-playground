// x18n's JS scanner does not read accessor chains yet, so Parla's `t.cart.items()` needs its own.
import { compileMessage, defaultFormats, loadConfig, ModuleScope } from '@parlajs/compiler';
import type { CustomFunctions, ResolvedConfig } from '@parlajs/compiler';
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

/** What the configs declare, filled once `configFinder` has loaded them. */
interface Declared {
  readonly functions: Record<string, CustomFunctions[string]>;
  /** The configs' `markup`, which a call may leave out. */
  readonly markup: Array<string>;
  /** `ns:key` of each `:string` select whose keys need different params. */
  readonly branchy: Set<string>;
}

interface ParlaOptions {
  /** Hooks that take a namespace or a list and return `{ t }`. Default: Parla's two React hooks. */
  readonly callees?: ReadonlyArray<string>;
  /** Parla configs whose namespaces x18n reads, relative to the root. Default: every `parla.config.ts`. */
  readonly configs?: ReadonlyArray<string>;
}

const isNode = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && typeof (value as Node).type === 'string';

/** `t.cart.items` → `{ root: 't', segments: ['cart', 'items'] }`; undefined for computed or non-member chains. */
function memberChain(node: Node): { root: Node; segments: Array<Node> } | undefined {
  const segments: Array<Node> = [];
  let current: unknown = node;
  while (isNode(current) && current.type === 'MemberExpression') {
    if (current.computed || !isNode(current.property)) {
      return undefined;
    }
    segments.unshift(current.property);
    current = current.object;
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
  for (const property of node.properties as Array<Node>) {
    const { key } = property;
    if (property.type !== 'Property' || property.computed || !isNode(key)) {
      return undefined;
    }
    if (key.type === 'Identifier') {
      keys.push(key.name as string);
    } else if (key.type === 'Literal') {
      keys.push(String(key.value));
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
  isNode(node) && node.type === 'Literal' && typeof node.value === 'string'
    ? node.value
    : undefined;

// Parla writes each namespace to `namespaces/<name>.js`, so the path names it whatever the binding.
const NAMESPACE_MODULE = /\/namespaces\/(?<name>[^/]+)\.js$/;

/** Local names of the namespace objects a file imports, to their namespace. */
function namespaceImports(program: Node): Map<string, string> {
  const out = new Map<string, string>();
  for (const statement of program.body as Array<Node>) {
    const name =
      statement.type === 'ImportDeclaration'
        ? NAMESPACE_MODULE.exec(stringValue(statement.source) ?? '')?.groups?.name
        : undefined;
    for (const specifier of name ? (statement.specifiers as Array<Node>) : []) {
      const { local } = specifier;
      if (specifier.type === 'ImportSpecifier' && isNode(local)) {
        out.set(local.name as string, name as string);
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
  const namespaces = (arg.elements as Array<unknown>).map((element) =>
    isNode(element) && element.type === 'Identifier' ? imports.get(element.name as string) : undefined,
  );
  return namespaces.every((ns) => ns !== undefined) ? namespaces : undefined;
}

/** `Translations<typeof a | typeof b>` → the namespaces of `a` and `b`; undefined for anything else. */
function translationsOf(type: unknown, imports: ReadonlyMap<string, string>): Array<string> | undefined {
  if (!isNode(type) || type.type !== 'TSTypeReference') {
    return undefined;
  }
  const name = type.typeName;
  const arg = ((type.typeArguments as Node | null)?.params as Array<Node> | undefined)?.at(0);
  if (!isNode(name) || name.name !== 'Translations' || !arg) {
    return undefined;
  }
  const queries = arg.type === 'TSUnionType' ? (arg.types as Array<Node>) : [arg];
  const namespaces = queries.map((query) => {
    const expr = query.exprName;
    return query.type === 'TSTypeQuery' && isNode(expr) ? imports.get(expr.name as string) : undefined;
  });
  return namespaces.every((ns) => ns !== undefined) ? namespaces : undefined;
}

/** The local name `t` is bound to in `{ t }` or `{ t: alias }`. */
function tName(pattern: Node): string | undefined {
  for (const property of pattern.properties as Array<Node>) {
    const { key, value } = property;
    if (
      property.type === 'Property' &&
      isNode(key) &&
      key.name === 't' &&
      isNode(value) &&
      value.type === 'Identifier'
    ) {
      return value.name as string;
    }
  }
  return undefined;
}

/** `{ t }: { t: Translations<typeof ns> }` in a component's params: `t` passed down by a parent. */
function propBinding(param: Node, imports: ReadonlyMap<string, string>): [string, Array<string>] | undefined {
  const literal = (param.typeAnnotation as Node | null)?.typeAnnotation;
  const name = param.type === 'ObjectPattern' ? tName(param) : undefined;
  if (!isNode(literal) || literal.type !== 'TSTypeLiteral' || name === undefined) {
    return undefined;
  }
  for (const member of literal.members as Array<Node>) {
    const { key } = member;
    if (member.type === 'TSPropertySignature' && isNode(key) && key.name === 't') {
      const namespaces = translationsOf((member.typeAnnotation as Node | null)?.typeAnnotation, imports);
      return namespaces && [name, namespaces];
    }
  }
  return undefined;
}

interface Collect {
  readonly callees: ReadonlySet<string>;
  readonly imports: ReadonlyMap<string, string>;
  readonly out: Array<Binding>;
}

function collectBindings(node: Node, scope: Node, collect: Collect): void {
  const { callees, imports, out } = collect;
  const inner = FUNCTIONS.has(node.type) ? node : scope;
  for (const param of FUNCTIONS.has(node.type) ? (node.params as Array<Node>) : []) {
    const binding = propBinding(param, imports);
    if (binding) {
      out.push({ name: binding[0], namespaces: binding[1], scope: node });
    }
  }
  if (node.type === 'VariableDeclarator') {
    const { init, id } = node;
    if (isNode(init) && init.type === 'CallExpression' && isNode(id) && id.type === 'ObjectPattern') {
      const { callee } = init;
      const [arg] = init.arguments as Array<Node>;
      const name = tName(id);
      const namespaces = namespacesOf(arg, imports);
      if (
        isNode(callee) &&
        callee.type === 'Identifier' &&
        callees.has(callee.name as string) &&
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
        collectBindings(child, inner, collect);
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
    const holds = binding.name === name && scope.start <= position && position < scope.end;
    if (holds && (!best || scope.end - scope.start < best.scope.end - best.scope.start)) {
      best = binding;
    }
  }
  return best;
}

/** The keys a call passes: none without an argument, unknown when they are not static. */
const paramKeys = (params: Node | undefined): Array<string> | undefined => (params ? staticKeys(params) : []);

function accessorScanner(callees: ReadonlySet<string>, declared: Declared): Scanner {
  return {
    id: 'parla:accessor',
    extensions: ['js', 'jsx', 'mjs', 'ts', 'tsx', 'mts'],
    scan(file) {
      const { program } = parseSync(file.path, file.text);
      const bindings: Array<Binding> = [];
      const root = program as unknown as Node;
      collectBindings(root, root, { callees, imports: namespaceImports(root), out: bindings });
      const usages: Array<Usage> = [];

      new Visitor({
        CallExpression(expression): void {
          const call = expression as unknown as Node;
          const { callee } = call;
          if (!isNode(callee)) {
            return;
          }
          const chain = memberChain(callee);
          const binding = chain && resolve(bindings, chain.root.name as string, call.start);
          if (!chain || !binding) {
            return;
          }
          // `t` is keyed by namespace: `t.checkout.title()`.
          const [head, ...segments] = chain.segments;
          const namespace = head.name as string | undefined;
          const first = segments.at(0);
          const last = segments.at(-1);
          if (namespace === undefined || !binding.namespaces.includes(namespace) || !first || !last) {
            return;
          }
          const params = (call.arguments as Array<Node>).at(0);
          const raw = segments.map((segment) => segment.name as string).join('.');
          usages.push({
            raw,
            range: { start: first.start, end: last.end },
            expression: { start: call.start, end: call.end },
            // TypeScript checks such a select's params per key; x18n compares one flat list.
            params: declared.branchy.has(`${namespace}:${raw}`) ? undefined : paramKeys(params),
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
function messageNames(value: string, functions: CustomFunctions): Array<string> {
  const formats = MF2_ONLY.test(value) ? ['mf2'] : ['icu', 'mf2'];
  let firstError: unknown;
  for (const id of formats) {
    const format = defaultFormats[id];
    try {
      const { info } = compileMessage(format.parse(value), new ModuleScope(), functions);
      return [...new Set([...info.params.keys(), ...info.markup])];
    } catch (error) {
      firstError ??= error;
    }
  }
  throw firstError;
}

const placeholders = (declared: Declared): PlaceholderSyntax => ({
  id: 'parla',
  example: '{name}',
  implicit: declared.markup,
  find(value) {
    let names: Array<string>;
    try {
      names = messageNames(value, declared.functions);
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
      messageNames(value, declared.functions);
      return [];
    } catch (error) {
      return [(error as Error).message];
    }
  },
});

interface Catalog {
  readonly [key: string]: string | Catalog;
}

/** `[path, message]` for every leaf of a catalog. */
function* leaves(catalog: Catalog, prefix = ''): Generator<[string, string]> {
  for (const [key, value] of Object.entries(catalog)) {
    if (typeof value === 'string') {
      yield [`${prefix}${key}`, value];
    } else {
      yield* leaves(value, `${prefix}${key}.`);
    }
  }
}

/** A catalog's JSON; an unreadable one counts as empty. */
async function readCatalog(readFile: (path: string) => Promise<string | undefined>, path: string): Promise<Catalog> {
  try {
    return JSON.parse((await readFile(path)) ?? '{}') as Catalog;
  } catch {
    return {};
  }
}

/** Whether a message selects on keys that need different params. */
function hasBranches(
  format: (typeof defaultFormats)[string] | undefined,
  value: string,
  functions: CustomFunctions,
): boolean {
  if (!format) {
    return false;
  }
  try {
    return Boolean(compileMessage(format.parse(value), new ModuleScope(), functions).info.branches);
  } catch {
    // Reported by `invalid-syntax`.
    return false;
  }
}

/** Fills `declared` from the configs and their source catalogs. */
async function declare(
  declared: Declared,
  configs: ReadonlyArray<ResolvedConfig>,
  readFile: (path: string) => Promise<string | undefined>,
): Promise<void> {
  for (const config of configs) {
    Object.assign(declared.functions, config.functions);
    declared.markup.push(...config.markup.filter((tag) => !declared.markup.includes(tag)));
  }
  const sources = configs.flatMap((config) => config.namespaces.map((ns) => ({ config, ns })));
  const catalogs = await Promise.all(
    sources.map(async ({ config, ns }) => readCatalog(readFile, ns.file(config.sourceLocale))),
  );
  for (const [index, { config, ns }] of sources.entries()) {
    for (const [key, value] of leaves(catalogs[index] ?? {})) {
      if (hasBranches(defaultFormats[ns.format], value, config.functions)) {
        declared.branchy.add(`${ns.name}:${key}`);
      }
    }
  }
}

/**
 * Each catalog file under the namespace its parla config gives it, so `scopeAudit` may live in
 * `scope_audit.json`; `pre`, so these names win over a `resources` pattern matching the same file.
 */
function configFinder(configs: ReadonlyArray<string> | undefined, declared: Declared): LocaleFinder {
  let loaded: Promise<Array<ResolvedConfig>> | undefined;
  const load = async (host: Parameters<LocaleFinder['find']>[0]['host']): Promise<Array<ResolvedConfig>> => {
    loaded ??= (async (): Promise<Array<ResolvedConfig>> => {
      const files =
        configs ??
        (await host.glob(['**/parla.config.ts'], { ignore: ['**/node_modules/**'], gitignore: true }));
      const all = await Promise.all(files.map(async (file) => loadConfig(host.root, file)));
      await declare(declared, all, async (path) => host.readFile(relative(host.root, path)));
      return all;
    })();
    return loaded;
  };
  let resolved: Array<ResolvedConfig> = [];
  return {
    id: 'parla:configs',
    async find({ host }) {
      resolved = await load(host);
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
      const ns = resolved
        .filter((config) => config.locales.includes(locale))
        .flatMap((config) => config.namespaces)
        .find((candidate) => candidate.name === namespace);
      return ns && relative(host.root, ns.file(locale));
    },
  };
}

export const parla = definePlugin((options: ParlaOptions = {}) => {
  const declared: Declared = { functions: {}, markup: [], branchy: new Set() };
  return {
    name: 'parla',
    enforce: 'pre' as const,
    runtime: 'node' as const,
    localeFinders: [configFinder(options.configs, declared)],
    scanners: [accessorScanner(new Set(options.callees ?? ['useParla']), declared)],
    placeholders: [placeholders(declared)],
  };
});
