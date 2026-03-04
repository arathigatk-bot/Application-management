import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// ============================================
// Production Security Hardening
// ============================================
if (import.meta.env.PROD) {
  // Disable all console output in production
  const noop = () => { };
  console.log = noop;
  console.warn = noop;
  console.debug = noop;
  console.info = noop;
  // Keep console.error for critical issues only

  // DevTools warning
  console.error(
    '%c⚠ WARNING',
    'color:red;font-size:24px;font-weight:bold',
  );
  console.error(
    '%cThis is a secured application. Unauthorized access is prohibited.',
    'color:red;font-size:14px',
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
