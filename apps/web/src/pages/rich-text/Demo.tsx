import { useParla } from '@parlajs/react';
import type { ReactNode } from 'react';

import { richText } from '../../parla/namespaces/richText.js';

const PARLA = 'https://github.com/marcalexiei/parla';
const renewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

const link = (children: ReactNode) => <a href={PARLA}>{children}</a>;

export function RichTextDemo() {
  const { t } = useParla([richText]);
  return (
    <ul className="values">
      {/* `strong`, `br` and `code` come from `createParla({ markup })`. */}
      <li>{t.richText.welcome({ name: 'Ada' })}</li>
      <li>{t.richText.address()}</li>
      <li>{t.richText.terms({ terms: link, privacy: link })}</li>
      <li>{t.richText.nested({ link })}</li>
      <li>{t.richText.plan({ plan: 'Pro', date: renewal, badge: (children) => <span className="badge">{children}</span> })}</li>
      <li>{t.richText.shortcut({ kbd: (children) => <kbd>{children}</kbd> })}</li>
    </ul>
  );
}
