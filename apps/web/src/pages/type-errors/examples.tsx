import type { Translations } from '@parlajs/react';

import { parla } from '../../parla.js';
import { account } from '../../parla/namespaces/account.js';
import { checkout } from '../../parla/namespaces/checkout.js';
import { select } from '../../parla/namespaces/select.js';

// As `useParla([checkout, select])` returns it.
declare const t: Translations<typeof checkout | typeof select>;

// A key that is not in the catalog.
// @ts-expect-error Property 'titel' does not exist on type 'CheckoutMessages<ReactNode>'. Did you mean 'title'?
t.checkout.titel();

// A namespace that was not loaded.
// @ts-expect-error Property 'account' does not exist on type 'Translations<Namespace<"checkout", …> | Namespace<"select", …>>'.
t.account.title();

// A missing param.
// @ts-expect-error Expected 1 arguments, but got 0.
t.checkout.items();

// A param of the wrong type: `:integer` takes a number.
// @ts-expect-error Type 'string' is not assignable to type 'number'.
t.checkout.items({ count: '2' });

// A message without params.
// @ts-expect-error Expected 0 arguments, but got 1.
t.checkout.title({ count: 2 });

// Rich text without its tag's callback.
// @ts-expect-error Property 'link' is missing in type '{}' but required in type '{ link: (children: ReactNode) => ReactNode; }'.
t.checkout.terms({});

// A select branch without its own param: `card` needs `last4`.
// @ts-expect-error Type '{ method: "card"; }' is missing the following properties from type '{ last4: string | number; method: string; reference: string | number; }': last4, reference
t.select.payment({ method: 'card' });

// A locale the catalog does not have.
// @ts-expect-error Argument of type '"fr"' is not assignable to parameter of type 'keyof LocaleRegistry'.
void parla.setLocale('fr');

// A `t` without the namespace a child needs.
function Profile(_: { t: Translations<typeof account> }) {
  return null;
}
// @ts-expect-error Property 'account' is missing in type 'Translations<…checkout… | …select…>' but required in type 'Translations<Namespace<"account", …>>'.
export const profile = <Profile t={t} />;
