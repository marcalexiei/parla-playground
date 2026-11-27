import { useParla } from '@parlajs/react';
import type { Translations } from '@parlajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { account } from '../../parla/namespaces/account.js';
import { checkout } from '../../parla/namespaces/checkout.js';

const PRICE = 19.9;
const delivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
const termsLink = (children: ReactNode): ReactNode => <a href="#/typed-props">{children}</a>;

function Cart({ t }: { t: Translations<typeof checkout> }): ReactNode {
  const [count, setCount] = useState(2);
  return (
    <section className="card">
      <h2>{t.checkout.title()}</h2>
      <p className="output">{t.checkout.items({ count })}</p>
      <div className="row">
        <button type="button" aria-label={t.checkout.remove()} onClick={() => {
            setCount((current) => Math.max(0, current - 1));
          }}>
          −
        </button>
        <button type="button" aria-label={t.checkout.add()} onClick={() => {
            setCount((current) => current + 1);
          }}>
          +
        </button>
      </div>
      <p>{t.checkout.total({ amount: count * PRICE })}</p>
      <p>{t.checkout.delivery({ date: delivery })}</p>
      <p className="muted">{t.checkout.terms({ link: termsLink })}</p>
      <button type="button" className="primary" disabled={count === 0}>
        {t.checkout.pay()}
      </button>
    </section>
  );
}

function Profile({ t }: { t: Translations<typeof account> }): ReactNode {
  const [place, setPlace] = useState(3);
  return (
    <section className="card">
      <h2>{t.account.title()}</h2>
      <p>{t.account.greeting({ name: 'Ada' })}</p>
      <p>
        <button type="button" className="link" onClick={() => {
            setPlace((current) => (current % 12) + 1);
          }}>
          {t.account.rank({ place })}
        </button>
      </p>
      <p className="muted">{t.account.role({ role: 'member' })}</p>
    </section>
  );
}

export function TypedPropsDemo(): ReactNode {
  // `t` holds both namespaces; each child asks for only one.
  const { t } = useParla([checkout, account]);
  return (
    <div className="grid">
      <Cart t={t} />
      <Profile t={t} />
    </div>
  );
}
