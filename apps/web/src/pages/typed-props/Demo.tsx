import { useParla } from '@parlajs/react';
import type { Translations } from '@parlajs/react';
import { useState } from 'react';

import { account } from '../../parla/namespaces/account.js';
import { checkout } from '../../parla/namespaces/checkout.js';

const PRICE = 19.9;
const delivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

export function TypedPropsDemo() {
  // `t` holds both namespaces; each child asks for only one.
  const { t } = useParla([checkout, account]);
  return (
    <div className="grid">
      <Cart t={t} />
      <Profile t={t} />
    </div>
  );
}

function Cart({ t }: { t: Translations<typeof checkout> }) {
  const [count, setCount] = useState(2);
  return (
    <section className="card">
      <h2>{t.checkout.title()}</h2>
      <p className="output">{t.checkout.items({ count })}</p>
      <div className="row">
        <button type="button" aria-label={t.checkout.remove()} onClick={() => setCount((c) => Math.max(0, c - 1))}>
          −
        </button>
        <button type="button" aria-label={t.checkout.add()} onClick={() => setCount((c) => c + 1)}>
          +
        </button>
      </div>
      <p>{t.checkout.total({ amount: count * PRICE })}</p>
      <p>{t.checkout.delivery({ date: delivery })}</p>
      <p className="muted">{t.checkout.terms({ link: (children) => <a href="#/typed-props">{children}</a> })}</p>
      <button type="button" className="primary" disabled={count === 0}>
        {t.checkout.pay()}
      </button>
    </section>
  );
}

function Profile({ t }: { t: Translations<typeof account> }) {
  const [place, setPlace] = useState(3);
  return (
    <section className="card">
      <h2>{t.account.title()}</h2>
      <p>{t.account.greeting({ name: 'Ada' })}</p>
      <p>
        <button type="button" className="link" onClick={() => setPlace((p) => (p % 12) + 1)}>
          {t.account.rank({ place })}
        </button>
      </p>
      <p className="muted">{t.account.role({ role: 'member' })}</p>
    </section>
  );
}
