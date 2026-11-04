import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { TourProvider } from './components/Tour';
import { SessionProvider } from './lib/session';
import { ToastProvider } from './lib/toast';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/shell.css';
import './styles/pages.css';

// The hosted demo runs in a frame without real URLs, so it keeps routes in memory.
const Router = import.meta.env.VITE_DEMO ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <SessionProvider>
        <ToastProvider>
          <TourProvider>
            <App />
          </TourProvider>
        </ToastProvider>
      </SessionProvider>
    </Router>
  </StrictMode>,
);
