/**
 * ENTRY    Order matters: fonts -> tokens -> global reset -> i18n init -> render.
 *          env.ts is validated when first imported (by apiClient / i18n), so bad config fails at startup.
 */
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import './styles/tokens.css';
import './styles/global.css';
import './shared/i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';

const container = document.getElementById('root');
if (!container) throw new Error('index.html must contain <div id="root">');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
