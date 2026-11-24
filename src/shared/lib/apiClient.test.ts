import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiClient } from './apiClient';
import { ApiError } from './apiError';
import { server } from '@/test/server';

describe('apiClient error mapping (every failure becomes ApiError)', () => {
  it('maps the backend envelope: code, status, message and field keys', async () => {
    server.use(
      http.post('/api/v1/x', () =>
        HttpResponse.json({ error: 'Validation failed', code: 'VALIDATION_FAILED', details: { fields: { name: 'validation.too_big' } } }, { status: 422 }),
      ),
    );
    const error = await apiClient.post('/v1/x', {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'VALIDATION_FAILED', status: 422, fields: { name: 'validation.too_big' } });
  });

  it('maps an unknown 5xx body to INTERNAL_ERROR', async () => {
    server.use(http.get('/api/v1/x', () => new HttpResponse('<html>bad gateway</html>', { status: 502 })));
    await expect(apiClient.get('/v1/x')).rejects.toMatchObject({ code: 'INTERNAL_ERROR', status: 502 });
  });

  it('maps a network failure to NETWORK_ERROR', async () => {
    server.use(http.get('/api/v1/x', () => HttpResponse.error()));
    await expect(apiClient.get('/v1/x')).rejects.toMatchObject({ code: 'NETWORK_ERROR', status: 0 });
  });
});
