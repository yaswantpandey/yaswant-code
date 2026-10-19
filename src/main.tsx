import './lib/fetchFix';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Check for SW updates every 60 seconds when the user is active
        setInterval(() => reg.update(), 60_000);
      })
      .catch(() => {
        // SW registration failed silently — app still works online
      });
  });
}
