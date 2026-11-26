import { useParla, useSuspenseParla } from '@parlajs/react';
import { Footer, Header } from '@playground/ui';
import { useMemo, useState } from 'react';

const PRICE = 19.9;

function Checkout() {
  const { t } = useSuspenseParla('checkout');
  const [count, setCount] = useState(2);
  const delivery = useMemo(() => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), []);
  return (
    <section className="card">
      <h2>{t.title()}</h2>
      <p className="items">{t.items({ count })}</p>
      <div className="row">
        <button type="button" onClick={() => setCount((c) => Math.max(0, c - 1))} aria-label={t.remove()}>
          −
        </button>
        <button type="button" onClick={() => setCount((c) => c + 1)} aria-label={t.add()}>
          +
        </button>
      </div>
      <p className="total">{t.total({ amount: count * PRICE })}</p>
      <p>{t.delivery({ date: delivery })}</p>
      <p className="muted">{t.terms({ link: (children) => <a href="#terms">{children}</a> })}</p>
      <button type="button" className="primary" disabled={count === 0}>
        {t.pay()}
      </button>
    </section>
  );
}

// Never suspends: a placeholder shows until the account chunk loads.
function Account() {
  const { t: common } = useSuspenseParla('common');
  const { t, ready } = useParla('account');
  const [notifications, setNotifications] = useState(3);
  const lastLogin = useMemo(() => new Date(Date.now() - 26 * 60 * 60 * 1000), []);
  if (!ready) {
    return <section className="card muted">{common.loading()}</section>;
  }
  return (
    <section className="card">
      <h2>{t.title()}</h2>
      <p>{t.greeting({ name: 'Ada' })}</p>
      <p>
        <button type="button" className="link" onClick={() => setNotifications((n) => (n + 1) % 4)}>
          {t.notifications({ count: notifications })}
        </button>
      </p>
      <p>{t.rank({ place: 3 })}</p>
      <p>{t.lastLogin({ when: lastLogin })}</p>
      <p className="muted">{t.role({ role: 'member' })}</p>
    </section>
  );
}

export function App() {
  const { t: common } = useSuspenseParla('common');
  const [showAccount, setShowAccount] = useState(false);
  return (
    <>
      <Header />
      <main>
        <Checkout />
        <div>
          <button type="button" onClick={() => setShowAccount((s) => !s)}>
            {showAccount ? common.actions.hideAccount() : common.actions.showAccount()}
          </button>
          {showAccount && <Account />}
        </div>
      </main>
      <Footer />
    </>
  );
}
