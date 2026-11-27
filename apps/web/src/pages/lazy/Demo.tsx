import { useParla } from '@parlajs/react';
import { Suspense, useState } from 'react';
import type { ReactNode } from 'react';

import { Loading } from '../../lab/Loading.js';
import { account } from '../../parla/namespaces/account.js';
import { lazy } from '../../parla/namespaces/lazy.js';

const lastLogin = new Date(Date.now() - 26 * 60 * 60 * 1000);

/** Nothing loaded `account` yet: the first render suspends until its chunk arrives. */
function Account(): ReactNode {
  const { t } = useParla([account]);
  return (
    <section className="card">
      <h2>{t.account.title()}</h2>
      <p>{t.account.greeting({ name: 'Ada' })}</p>
      <p>{t.account.notifications({ count: 2 })}</p>
      <p className="muted">{t.account.lastLogin({ when: lastLogin })}</p>
    </section>
  );
}

/** `lazy` was loaded by the route loader in `routes.ts`, so this never suspends. */
export function LazyDemo(): ReactNode {
  const { t } = useParla([lazy]);
  const [open, setOpen] = useState(false);
  return (
    <>
      <p>{t.lazy.loaded()}</p>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((wasOpen) => !wasOpen);
        }}>
        {open ? t.lazy.hide() : t.lazy.show()}
      </button>
      {open && (
        <Suspense fallback={<Loading>{t.lazy.suspending()}</Loading>}>
          <Account />
        </Suspense>
      )}
      <p className="muted">{t.lazy.cached()}</p>
    </>
  );
}
