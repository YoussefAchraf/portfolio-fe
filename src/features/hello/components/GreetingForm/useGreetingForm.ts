/**
 * LAYER    features/<name>/components/<Thing>/use<Thing>.ts  (component LOGIC - no JSX, no styles, no text)
 * ROLE     Form state (react-hook-form + zod), submit through useSayHello, map failures to i18n keys.
 *          The component only binds what this returns.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import type { BaseSyntheticEvent } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { greetingSchema } from '../../greetingSchema';
import type { GreetingFormValues } from '../../greetingSchema';
import { useSayHello } from '../../hooks/useSayHello';
import { ApiError } from '@/shared/lib/apiError';

export interface IGreetingFormState {
  nameField: UseFormRegisterReturn<'name'>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  /** i18n key of the field error (client rule or server 422), if any. */
  fieldErrorKey: string | undefined;
  /** i18n key of a non-field failure (network, 500...), if any. */
  serverErrorKey: string | undefined;
  /** The backend's own answer, e.g. "hello Ada". */
  answer: string | undefined;
}

export function useGreetingForm(): IGreetingFormState {
  const form = useForm<GreetingFormValues>({ resolver: zodResolver(greetingSchema), defaultValues: { name: '' } });
  const sayHello = useSayHello();

  const onSubmit = form.handleSubmit(async ({ name }) => {
    try {
      await sayHello.mutateAsync(name);
      form.reset();
    } catch (error) {
      if (error instanceof ApiError && error.fields['name']) {
        form.setError('name', { message: 'common:errors.VALIDATION_FAILED' });
      }
    }
  });

  const mutationError = sayHello.error;
  const fieldErrorKey = form.formState.errors.name?.message;
  return {
    nameField: form.register('name'),
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    fieldErrorKey,
    serverErrorKey: mutationError && !fieldErrorKey ? `common:errors.${mutationError.code}` : undefined,
    answer: sayHello.data?.message,
  };
}
