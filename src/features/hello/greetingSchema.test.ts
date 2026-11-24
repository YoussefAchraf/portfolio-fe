import { describe, expect, it } from 'vitest';
import { greetingSchema } from './greetingSchema';

describe('greetingSchema (same rule as the backend Greeting entity)', () => {
  it('trims the name', () => {
    expect(greetingSchema.parse({ name: '  Ada  ' })).toEqual({ name: 'Ada' });
  });

  it.each([
    ['', 'hello:validation.nameRequired'],
    ['   ', 'hello:validation.nameRequired'],
    ['x'.repeat(61), 'hello:validation.nameTooLong'],
  ])('rejects %j with the i18n key %s', (name, key) => {
    const result = greetingSchema.safeParse({ name });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(key);
  });
});
