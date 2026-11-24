/**
 * LAYER    shared/lib
 * ROLE     The ONLY reader of import.meta.env. Validates the public build-time variables with zod and
 *          exports one frozen, typed object. Invalid config fails at startup, not in a random component.
 * RULES    Every VITE_* value is PUBLIC (bundled into the browser) - never a secret. Add a variable here,
 *          in .env.example and in docs/configuration.md together.
 */
import { z } from 'zod';

const schema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default('/api'),
  VITE_DEFAULT_LOCALE: z.enum(['en', 'fr']).default('en'),
});

const parsed = schema.safeParse(import.meta.env);
if (!parsed.success) {
  throw new Error(`Invalid VITE_* configuration: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`);
}

export const env = Object.freeze({
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
  defaultLocale: parsed.data.VITE_DEFAULT_LOCALE,
});
