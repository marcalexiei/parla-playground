import './styles.css';

import { ParlaProvider } from '@parlajs/react';
import { common } from '@playground/ui/namespaces/common.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.js';
import { startFlash } from './lab/flash.js';
import { startLocaleSync } from './lab/locale.js';
import { withCause } from './lab/store.js';
import { parla } from './parla.js';
import { shell } from './parla/namespaces/shell.js';
import { startRouter } from './router.js';

const root = document.querySelector('#root');
if (!root) {
  throw new Error('index.html has no #root');
}

startLocaleSync();
startFlash();
// The shell's namespaces and the first page load before the first render, so nothing suspends.
await Promise.all([withCause('startup', async () => parla.load([shell, common])), startRouter()]);
createRoot(root).render(
  <StrictMode>
    <ParlaProvider parla={parla}>
      <App />
    </ParlaProvider>
  </StrictMode>,
);
