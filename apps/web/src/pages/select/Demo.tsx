import { useParla } from '@parlajs/react';
import { useState } from 'react';

import { select } from '../../parla/namespaces/select.js';

const METHODS = ['card', 'transfer', 'cash', 'voucher'] as const;
const ROLES = ['admin', 'member', 'guest'] as const;

export function SelectDemo() {
  const { t } = useParla([select]);
  const [method, setMethod] = useState<(typeof METHODS)[number]>('card');
  const [role, setRole] = useState<(typeof ROLES)[number]>('member');

  // Each key takes only its own params; any other string needs them all.
  const [call, text] =
    method === 'card'
      ? ["{ method: 'card', last4: '4242' }", t.select.payment({ method, last4: '4242' })]
      : method === 'transfer'
        ? ["{ method: 'transfer', reference: 'INV-2048' }", t.select.payment({ method, reference: 'INV-2048' })]
        : method === 'cash'
          ? ["{ method: 'cash' }", t.select.payment({ method })]
          : ["{ method: 'voucher', last4: '', reference: '' }", t.select.payment({ method, last4: '', reference: '' })];

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

function Choice<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: ReadonlyArray<T>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="choice" role="radiogroup" aria-label={name} dir="ltr">
      <code>{name}</code>
      {options.map((option) => (
        <button key={option} type="button" role="radio" aria-checked={option === value} onClick={() => onChange(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}
