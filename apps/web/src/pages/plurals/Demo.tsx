import { useLocale, useParla } from '@parlajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { pluralsIcu } from '../../parla/namespaces/pluralsIcu.js';
import { pluralsMf2 } from '../../parla/namespaces/pluralsMf2.js';

/** The locale's categories, with the one `value` falls in marked. */
function Categories({ rules, value }: { rules: Intl.PluralRules; value: number }): ReactNode {
  const current = rules.select(value);
  return (
    <span className="categories" dir="ltr">
      {rules.resolvedOptions().pluralCategories.map((category) => (
        <span key={category} className={category === current ? 'category active' : 'category'}>
          {category}
        </span>
      ))}
    </span>
  );
}

export function PluralsDemo(): ReactNode {
  const { t } = useParla([pluralsIcu, pluralsMf2]);
  const { locale } = useLocale();
  const [count, setCount] = useState(3);
  const [place, setPlace] = useState(2);
  const cardinal = new Intl.PluralRules(locale);
  const ordinal = new Intl.PluralRules(locale, { type: 'ordinal' });

  return (
    <>
      <div className="controls" dir="ltr">
        <label>
          <code>count = {count}</code>
          <input
            type="range"
            min={0}
            max={30}
            value={count}
            onChange={(event) => {
              setCount(Number(event.target.value));
            }}
          />
        </label>
        <label>
          <code>place = {place}</code>
          <input
            type="range"
            min={1}
            max={30}
            value={place}
            onChange={(event) => {
              setPlace(Number(event.target.value));
            }}
          />
        </label>
      </div>
      <table className="compare">
        <thead>
          <tr>
            <th />
            <th>ICU</th>
            <th>MF2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              <code>files</code> <Categories rules={cardinal} value={count} />
            </th>
            <td>{t.pluralsIcu.files({ count })}</td>
            <td>{t.pluralsMf2.files({ count })}</td>
          </tr>
          <tr>
            <th>
              <code>place</code> <Categories rules={ordinal} value={place} />
            </th>
            <td>{t.pluralsIcu.place({ place })}</td>
            <td>{t.pluralsMf2.place({ place })}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
