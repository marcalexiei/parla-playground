import { useParla } from '@parlajs/react';
import { Pagination } from '@playground/ui';
import { common } from '@playground/ui/namespaces/common.js';
import { useState } from 'react';
import type { ReactNode } from 'react';

const TOTAL = 12;

export function SharedPackageDemo(): ReactNode {
  // The package's own namespace object, used here as the app's own.
  const { t } = useParla([common]);
  const [page, setPage] = useState(1);
  return (
    <>
      <Pagination page={page} total={TOTAL} onChange={setPage} />
      <p className="output">{t.common.pager.status({ page, total: TOTAL })}</p>
    </>
  );
}
