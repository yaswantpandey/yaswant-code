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

// Register service workers for PWA offline support + FCM push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // PWA caching SW
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => { setInterval(() => reg.update(), 60_000); })
      .catch(() => {});
    // FCM background message handler SW
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js', { scope: '/' })
      .catch(() => {});
  });
}
