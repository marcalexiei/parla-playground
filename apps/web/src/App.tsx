import { useT } from '@parlajs/react';
import { Footer, Header } from '@playground/ui';
import { Suspense, useMemo, useState } from 'react';

const PRICE = 19.9;

function Checkout() {
  const t = useT('checkout');
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

function Account() {
  const t = useT('account');
  const [notifications, setNotifications] = useState(3);
  const lastLogin = useMemo(() => new Date(Date.now() - 26 * 60 * 60 * 1000), []);
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
  const common = useT('common');
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
          {showAccount && (
            <Suspense fallback={<p className="muted">{common.loading()}</p>}>
              <Account />
            </Suspense>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
