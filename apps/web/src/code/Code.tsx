import type { ReactNode } from 'react';

const TOKEN =
  /(?<comment>\/\/.*)|(?<key>"(?:[^"\\]|\\.)*"(?=\s*:))|(?<string>"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(?<keyword>import|from|export|const|let|function|return|type|interface|extends|typeof|as|await|async|if|new|default|satisfies|declare|readonly)\b|(?<t>\bt(?:\.\w+)+)/g;
const KINDS = ['comment', 'key', 'string', 'keyword', 't'] as const;

function highlight(line: string): ReactNode {
  const out: Array<ReactNode> = [];
  let last = 0;
  for (const match of line.matchAll(TOKEN)) {
    out.push(line.slice(last, match.index));
    const kind = KINDS.find((name) => match.groups?.[name] !== undefined);
    out.push(
      <span key={match.index} className={`tok-${kind}`}>
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  out.push(line.slice(last));
  return out;
}

const EXPECT = /^\s*\/\/ @ts-expect-error (?<message>.*)$/;

/** Highlighted source; a `// @ts-expect-error <message>` line marks the next line as an error. */
export function Code({ source }: { source: string }): ReactNode {
  const lines = source.replace(/\n$/, '').split('\n');
  const out: Array<ReactNode> = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const expected = EXPECT.exec(line);
    if (expected && index + 1 < lines.length) {
      index += 1;
      out.push(
        <span key={index}>
          <span className="error-line">{highlight(lines[index] ?? '')}</span>
          {'\n'}
          <span className="error-message">{expected.groups?.message}</span>
          {'\n'}
        </span>,
      );
    } else {
      out.push(
        <span key={index}>
          {highlight(line)}
          {'\n'}
        </span>,
      );
    }
  }
  return (
    <pre className="code" dir="ltr" translate="no">
      <code>{out}</code>
    </pre>
  );
}
