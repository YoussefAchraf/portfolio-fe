/**
 * TEST     Vitest setupFiles (runs before every test file): jest-dom matchers, real i18n ('en'), MSW
 *          lifecycle (unhandled requests FAIL the test), state reset and DOM cleanup after each test.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetHelloDb } from './handlers/helloHandlers';
import { server } from './server';
import { i18n } from '@/shared/i18n';

beforeAll(async () => {
  server.listen({ onUnhandledRequest: 'error' });
  await i18n.changeLanguage('en');
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetHelloDb();
});

afterAll(() => {
  server.close();
});
