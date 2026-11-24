import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { ServerGate } from './ServerGate';
import { renderWithProviders } from '@/test/renderWithProviders';
import { server } from '@/test/server';

const FAST = { pollMs: 20, slowAfterMs: 60, timeoutMs: 400 };
const notReady = (): Response => HttpResponse.json({ status: 'not_ready', checks: { postgres: 'down' } }, { status: 503 });
const ready = (): Response => HttpResponse.json({ status: 'ready', checks: { postgres: 'ok' } });

function renderGate(): void {
  renderWithProviders(
    <ServerGate timings={FAST}>
      <p>the app</p>
    </ServerGate>,
  );
}

describe('ServerGate (real apiClient + hooks, backend simulated by MSW)', () => {
  it('shows the app once the backend and its database are ready', async () => {
    renderGate();
    expect(await screen.findByText('the app')).toBeInTheDocument();
    // The splash only fades out now: hidden from assistive technology, no status message announced.
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('keeps the app hidden and tells the user while the backend is waking up', async () => {
    server.use(http.get('/api/ready', notReady));
    renderGate();
    expect(await screen.findByText('Waking up the server...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('the app')).not.toBeInTheDocument();
  });

  it('treats an unreachable backend (proxy error while it boots) as still waking', async () => {
    server.use(http.get('/api/ready', () => HttpResponse.error()));
    renderGate();
    expect(await screen.findByText('Waking up the server...')).toBeInTheDocument();
    expect(screen.queryByText('the app')).not.toBeInTheDocument();
  });

  it('says it can take a minute, then opens the app as soon as the backend wakes up', async () => {
    let awake = false;
    server.use(http.get('/api/ready', () => (awake ? ready() : notReady())));
    renderGate();
    expect(await screen.findByText('Still waking up - this can take up to a minute.')).toBeInTheDocument();
    awake = true;
    expect(await screen.findByText('the app')).toBeInTheDocument();
  });

  it('stops after the time limit and lets the user try again', async () => {
    const user = userEvent.setup();
    let awake = false;
    server.use(http.get('/api/ready', () => (awake ? ready() : notReady())));
    renderGate();
    expect(await screen.findByRole('alert')).toHaveTextContent('The server did not wake up.');
    awake = true;
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('the app')).toBeInTheDocument();
  });
});
