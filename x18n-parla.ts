// x18n's JS scanner does not read accessor chains yet, so Parla's `t.cart.items()` needs its own.
import { compileMessage, defaultFormats, ModuleScope } from '@parlajs/compiler';
import { definePlugin } from '@x18n/cli';
import type { Plugin, Scanner } from '@x18n/cli';
import { parseSync, Visitor } from 'oxc-parser';

type Usage = Awaited<ReturnType<Scanner['scan']>>['usages'][number];

type PlaceholderSyntax = NonNullable<Plugin['placeholders']>[number];
type Placeholder = ReturnType<PlaceholderSyntax['find']>[number];

type Node = { type: string; start: number; end: number } & Record<string, unknown>;

interface ParlaOptions {
  /** Hooks that take a namespace or a list and return `{ t }`. Default: Parla's two React hooks. */
  readonly callees?: readonly string[];
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

/** A `const { t } = useSuspenseParla(['a', 'b'])`, visible inside `scope`; `t` is keyed by namespace. */
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

/** `['a', 'b']`; undefined unless every namespace is a string literal. */
function namespacesOf(arg: unknown): Array<string> | undefined {
  if (!isNode(arg) || arg.type !== 'ArrayExpression') {
    return undefined;
  }
  const namespaces = (arg['elements'] as Array<unknown>).map(stringValue);
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
      const namespaces = namespacesOf(arg);
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
        collectBindings(child, inner, callees, out);
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
      collectBindings(program as unknown as Node, program as unknown as Node, callees, bindings);
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

export const parla = definePlugin((options: ParlaOptions = {}) => ({
  name: 'parla',
  scanners: [accessorScanner(new Set(options.callees ?? ['useSuspenseParla', 'useParla']))],
  placeholders: [parlaPlaceholders],
}));
