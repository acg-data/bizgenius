import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import * as Sentry from '@sentry/react'
import convex from './lib/convex'
import { HeroUIProvider } from '@heroui/react'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import { GenerationProvider } from './contexts/GenerationContext'
import './index.css'

// Initialize Sentry in production
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV || 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <HeroUIProvider>
          <ToastProvider>
            <GenerationProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </GenerationProvider>
          </ToastProvider>
        </HeroUIProvider>
      </ConvexAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
