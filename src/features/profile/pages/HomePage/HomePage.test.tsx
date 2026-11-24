import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import HomePage from './HomePage';
import { renderWithProviders } from '@/test/renderWithProviders';
import { server } from '@/test/server';

describe('public home', () => {
  it('requests the locale from the route and remembers the theme', async () => {
    server.use(http.get('*/api/v1/profile', ({ request }) => {
      const french = new URL(request.url).searchParams.get('lang') === 'fr';
      return HttpResponse.json({
        name: 'Achraf Youssef', headline: french ? 'Ingenieur logiciel' : 'Software Engineer',
        pitch: 'Web', about: 'About', availability: 'Available', location: 'Tunisia',
        portrait: { url: '/portrait-placeholder.svg', alt: 'Portrait' },
      });
    }));
    renderWithProviders(<HomePage />, ['/fr']);
    expect(await screen.findByText('Ingenieur logiciel')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/');
    await userEvent.setup().selectOptions(screen.getByRole('combobox'), 'light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.cookie).toContain('portfolio-theme=light');
    await userEvent.setup().selectOptions(screen.getByRole('combobox'), 'dark');
  });
});
