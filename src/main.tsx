import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter, MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { TourProvider } from './components/Tour';
import { PipelineProvider } from './lib/pipelineStore';
import { SessionProvider } from './lib/session';
import { ToastProvider } from './lib/toast';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/shell.css';
import './styles/pages.css';
import './styles/intro.css';

// The claude.ai demo runs in a frame without real URLs, so it keeps routes in memory.
// GitHub Pages serves static files only, so it keeps the screen after a # (e.g. /ahaata/#/pipeline).
const Router = import.meta.env.VITE_DEMO ? MemoryRouter : import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <SessionProvider>
        <ToastProvider>
          <PipelineProvider>
            <TourProvider>
              <App />
            </TourProvider>
          </PipelineProvider>
        </ToastProvider>
      </SessionProvider>
    </Router>
  </StrictMode>,
);
