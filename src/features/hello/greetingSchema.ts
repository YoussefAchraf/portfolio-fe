/**
 * LAYER    features/<name>  (feature-root schema)
 * ROLE     Client-side validation of the greeting form: same rule as the backend (1-60 characters after
 *          trimming) for instant feedback. The backend re-checks; its 422 fields are shown too.
 * RULES    Messages are i18n KEYS, never text.
 */
import { z } from 'zod';

export const GREETING_NAME_MAX = 60;

export const greetingSchema = z.object({
  name: z.string().trim().min(1, 'hello:validation.nameRequired').max(GREETING_NAME_MAX, 'hello:validation.nameTooLong'),
});

export type GreetingFormValues = z.infer<typeof greetingSchema>;
