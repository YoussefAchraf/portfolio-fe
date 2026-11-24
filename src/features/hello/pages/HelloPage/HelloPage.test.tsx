import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import HelloPage from './HelloPage';
import { helloDb } from '@/test/handlers/helloHandlers';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('HelloPage (real apiClient + hooks + components, backend simulated by MSW)', () => {
  it('shows the stack status: frontend, API and database OK', async () => {
    renderWithProviders(<HelloPage />);
    await waitFor(() => expect(screen.getByTestId('status-hello:status.database')).toHaveTextContent('OK'));
    expect(screen.getByTestId('status-hello:status.api')).toHaveTextContent('OK');
  });

  it('reports the database as down when /ready says so', async () => {
    helloDb.databaseUp = false;
    renderWithProviders(<HelloPage />);
    await waitFor(() => expect(screen.getByTestId('status-hello:status.database')).toHaveTextContent('Down'));
  });

  it('sends the name, shows the backend answer and lists the stored greeting', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HelloPage />);
    expect(await screen.findByText('No greetings yet. Be the first.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Your name'), '  Ada ');
    await user.click(screen.getByRole('button', { name: 'Say hello' }));

    expect(await screen.findByText('hello Ada')).toBeInTheDocument();
    const list = screen.getByRole('region', { name: 'Latest greetings (from the database)' });
    expect(await within(list).findByText('Ada')).toBeInTheDocument();
    expect(screen.getByLabelText('Your name')).toHaveValue('');
  });

  it('validates on the client before calling the backend', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HelloPage />);
    await user.click(screen.getByRole('button', { name: 'Say hello' }));
    expect(await screen.findByText('Enter a name.')).toBeInTheDocument();
    expect(screen.getByLabelText('Your name')).toHaveAttribute('aria-invalid', 'true');
    expect(helloDb.greetings).toHaveLength(0);
  });
});
