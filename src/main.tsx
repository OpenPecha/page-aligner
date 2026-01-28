import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './lib/i18n'; // Initialize i18n before App
import App from './App.tsx';

async function enableMocking() {

  return false
  const { worker } = await import('./mocks/browser')
  
  return worker.start({
    onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
