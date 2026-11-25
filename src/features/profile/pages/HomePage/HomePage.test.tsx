import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './HomePage';
import { renderWithProviders } from '@/test/renderWithProviders';
import { server } from '@/test/server';

describe('public home', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('requests the locale from the route and remembers the theme', async () => {
    server.use(http.get('*/api/v1/profile', ({ request }) => {
      const french = new URL(request.url).searchParams.get('lang') === 'fr';
      return HttpResponse.json({
        name: 'Achraf Youssef', headline: french ? 'Ingénieur logiciel' : 'Software Engineer',
        pitch: 'Web', about: 'About', availability: 'Available', location: 'Tunisia',
        portrait: { url: '/portrait-placeholder.svg', alt: 'Portrait' },
      });
    }));
    renderWithProviders(<HomePage />, ['/fr']);
    expect(await screen.findByText('Ingénieur logiciel')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/');
    await userEvent.setup().click(screen.getByRole('button', { name: /Changer de th/ }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.cookie).toContain('portfolio-theme=light');
    await userEvent.setup().click(screen.getByRole('button', { name: /Changer de th/ }));
    expect(document.documentElement.dataset.theme).toBeUndefined();
    await userEvent.setup().click(screen.getByRole('button', { name: /Changer de th/ }));
  });
});
