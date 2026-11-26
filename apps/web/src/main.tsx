import { createParla, matchLocale, ParlaProvider } from '@parlajs/react';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import { catalog } from './parla/catalog.js';
import './styles.css';

const saved = localStorage.getItem('locale');
const parla = createParla({
  catalog,
  locale: matchLocale(saved ? [saved, ...navigator.languages] : navigator.languages, catalog.locales, catalog.sourceLocale),
});

const syncDocument = () => {
  document.documentElement.lang = parla.locale;
  localStorage.setItem('locale', parla.locale);
};
parla.subscribe(syncDocument);
syncDocument();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ParlaProvider parla={parla}>
      <Suspense fallback={null}>
        <App />
      </Suspense>
    </ParlaProvider>
  </StrictMode>,
);
