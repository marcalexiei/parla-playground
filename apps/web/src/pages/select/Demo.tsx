import { useParla } from '@parlajs/react';
import type { Translations } from '@parlajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { select } from '../../parla/namespaces/select.js';

const METHODS = ['card', 'transfer', 'cash', 'voucher'] as const;
const ROLES = ['admin', 'member', 'guest'] as const;

type Method = (typeof METHODS)[number];

/** Each key takes only its own params; any other string needs them all. */
function payment({ t, method }: { t: Translations<typeof select>; method: Method }): [string, ReactNode] {
  if (method === 'card') {
    return ["{ method: 'card', last4: '4242' }", t.select.payment({ method, last4: '4242' })];
  }
  if (method === 'transfer') {
    return ["{ method: 'transfer', reference: 'INV-2048' }", t.select.payment({ method, reference: 'INV-2048' })];
  }
  if (method === 'cash') {
    return ["{ method: 'cash' }", t.select.payment({ method })];
  }
  // `voucher` has no branch of its own.
  return ["{ method: 'voucher', last4: '', reference: '' }", t.select.payment({ method, last4: '', reference: '' })];
}

function Choice<Option extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: ReadonlyArray<Option>;
  value: Option;
  onChange: (value: Option) => void;
}): ReactNode {
  return (
    <div className="choice" role="radiogroup" aria-label={name} dir="ltr">
      <code>{name}</code>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={option === value}
          onClick={() => {
            onChange(option);
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function SelectDemo(): ReactNode {
  const { t } = useParla([select]);
  const [method, setMethod] = useState<Method>('card');
  const [role, setRole] = useState<(typeof ROLES)[number]>('member');

  const [call, text] = payment({ t, method });

  return (
    <>
      <Choice name="method" options={METHODS} value={method} onChange={setMethod} />
      <pre className="call" dir="ltr">t.select.payment({call})</pre>
      <p className="output">{text}</p>
      <Choice name="role" options={ROLES} value={role} onChange={setRole} />
      <p className="output">{t.select.role({ role })}</p>
    </>
  );
}
