// Side effects: `<html lang dir>` follows the locale, and a switch highlights what changed.
import './lab/locale.js';
import './lab/flash.js';
import './styles.css';

import { ParlaProvider } from '@parlajs/react';
import { common } from '@playground/ui/namespaces/common.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.js';
import { withCause } from './lab/store.js';
import { parla } from './parla.js';
import { shell } from './parla/namespaces/shell.js';
import { startRouter } from './router.js';

// The shell's namespaces and the first page load before the first render, so nothing suspends.
void Promise.all([withCause('startup', async () => parla.load([shell, common])), startRouter()]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ParlaProvider parla={parla}>
        <App />
      </ParlaProvider>
    </StrictMode>,
  );
});
