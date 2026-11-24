/**
 * TEST     MSW in Node mode (never a browser service worker - no PWA, ever). Started in setup.ts.
 *          Add each feature's handlers here.
 */
import { setupServer } from 'msw/node';
import { helloHandlers } from './handlers/helloHandlers';

export const server = setupServer(...helloHandlers);
