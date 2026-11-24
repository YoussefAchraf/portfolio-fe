/**
 * TEST     MSW handlers that behave like the backend contract for the hello feature (stateful: a POST
 *          shows up in the next GET), so tests exercise the REAL apiClient, hooks and components.
 */
import { http, HttpResponse } from 'msw';
import type { IGreeting } from '@/features/hello/api/helloApi';

export const helloDb: { greetings: IGreeting[]; databaseUp: boolean } = { greetings: [], databaseUp: true };

export function resetHelloDb(): void {
  helloDb.greetings = [];
  helloDb.databaseUp = true;
}

export const helloHandlers = [
  http.get('/api/ready', () =>
    helloDb.databaseUp
      ? HttpResponse.json({ status: 'ready', checks: { postgres: 'ok' } })
      : HttpResponse.json({ status: 'not_ready', checks: { postgres: 'down' } }, { status: 503 }),
  ),
  http.get('/api/v1/hello', () => HttpResponse.json({ message: 'hello', users: [], greetings: [...helloDb.greetings].reverse() })),
  http.post('/api/v1/hello', async ({ request }) => {
    const body = (await request.json()) as { name?: unknown };
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 1 || name.length > 60) {
      return HttpResponse.json(
        { error: 'Validation failed', code: 'VALIDATION_FAILED', details: { fields: { name: 'validation.too_small' } } },
        { status: 422 },
      );
    }
    const greeting = { id: `g${helloDb.greetings.length + 1}`, name, createdAt: '2026-01-01T00:00:00.000Z' };
    helloDb.greetings.push(greeting);
    return HttpResponse.json({ message: `hello ${name}`, greeting }, { status: 201 });
  }),
];
