import type { ReactNode } from 'react';

const TOKEN =
  /(\/\/.*)|("(?:[^"\\]|\\.)*"(?=\s*:))|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(import|from|export|const|let|function|return|type|interface|extends|typeof|as|await|async|if|new|default|satisfies|declare|readonly)\b|(\bt(?:\.\w+)+)/g;
const CLASSES = ['', 'tok-comment', 'tok-key', 'tok-string', 'tok-keyword', 'tok-t'];

function highlight(line: string): ReactNode {
  const out: Array<ReactNode> = [];
  let last = 0;
  for (const match of line.matchAll(TOKEN)) {
    out.push(line.slice(last, match.index));
    const group = match.findIndex((g, i) => i > 0 && g !== undefined);
    out.push(
      <span key={match.index} className={CLASSES[group]}>
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  out.push(line.slice(last));
  return out;
}

const EXPECT = /^\s*\/\/ @ts-expect-error (.*)$/;

/** Highlighted source; a `// @ts-expect-error <message>` line marks the next line as an error. */
export function Code({ source }: { source: string }) {
  const lines = source.replace(/\n$/, '').split('\n');
  const out: Array<ReactNode> = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    const expected = EXPECT.exec(line);
    if (expected && i + 1 < lines.length) {
      i += 1;
      out.push(
        <span key={i}>
          <span className="error-line">{highlight(lines[i] ?? '')}</span>
          {'\n'}
          <span className="error-message">{expected[1]}</span>
          {'\n'}
        </span>,
      );
    } else {
      out.push(
        <span key={i}>
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
