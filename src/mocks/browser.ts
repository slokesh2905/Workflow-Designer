/**
 * MSW browser worker setup.
 * The generated `mockServiceWorker.js` must be served from the public root.
 * Run: npx msw init public/ --save  (once, after npm install)
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
