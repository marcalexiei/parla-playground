import { useLocale, useParla } from '@parlajs/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { formatting } from '../../parla/namespaces/formatting.js';

const CURRENCIES = ['EUR', 'USD', 'JPY', 'GBP'];

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return (): void => {
      clearInterval(id);
    };
  }, []);
  return now;
}

export function FormattingDemo(): ReactNode {
  const { t } = useParla([formatting]);
  const { locale } = useLocale();
  const [amount, setAmount] = useState(1234.5);
  const [currency, setCurrency] = useState('EUR');
  const [days, setDays] = useState(1);
  const now = useNow();
  const currencies = new Intl.DisplayNames([locale], { type: 'currency' });

  return (
    <>
      <div className="controls">
        <label>
          {t.formatting.input.amount()}
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(event) => {
              setAmount(Number(event.target.value));
            }}
          />
        </label>
        <label>
          {t.formatting.input.currency()}
          <select
            value={currency}
            onChange={(event) => {
              setCurrency(event.target.value);
            }}>
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {currencies.of(code)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.formatting.input.days()} <code dir="ltr">{days}</code>
          <input
            type="range"
            min={-7}
            max={14}
            value={days}
            onChange={(event) => {
              setDays(Number(event.target.value));
            }}
          />
        </label>
      </div>
      <ul className="values">
        <li>{t.formatting.price({ amount, currency })}</li>
        <li>{t.formatting.distance({ km: 42.195 })}</li>
        <li>{t.formatting.speed({ kmh: 129.7 })}</li>
        <li>{t.formatting.share({ ratio: 0.2563 })}</li>
        <li>{t.formatting.views({ views: 1_284_000 })}</li>
        <li>{t.formatting.date({ when: now })}</li>
        <li>{t.formatting.time({ when: now })}</li>
        <li>{t.formatting.datetime({ when: now })}</li>
        <li>{t.formatting.relative({ days })}</li>
      </ul>
    </>
  );
}
