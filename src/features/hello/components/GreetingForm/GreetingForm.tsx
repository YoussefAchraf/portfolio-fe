/**
 * LAYER    features/<name>/components/<Thing>/<Thing>.tsx  (STRUCTURE - JSX only)
 * ROLE     The name input that writes to the database through the backend, and the backend's answer.
 * ANATOMY  GreetingForm.tsx (structure) + .module.css (presentation) + .data.json (i18n keys + static
 *          config) + useGreetingForm.ts (logic). No inline styles, no literal text, no fetching here.
 * A11Y     Visible label bound to the input, error linked with aria-describedby, answer in a live region.
 */
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import data from './GreetingForm.data.json';
import styles from './GreetingForm.module.css';
import { useGreetingForm } from './useGreetingForm';

export function GreetingForm(): ReactElement {
  const { t } = useTranslation();
  const { nameField, onSubmit, isSubmitting, fieldErrorKey, serverErrorKey, answer } = useGreetingForm();
  const errorId = `${data.inputId}-error`;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <label className={styles.label} htmlFor={data.inputId}>
        {t(data.labelKey)}
      </label>
      <div className={styles.row}>
        <input
          {...nameField}
          id={data.inputId}
          className={styles.input}
          placeholder={t(data.placeholderKey)}
          maxLength={data.maxLength}
          autoComplete="name"
          aria-invalid={fieldErrorKey ? true : undefined}
          aria-describedby={fieldErrorKey ? errorId : undefined}
        />
        <button className={styles.button} type="submit" disabled={isSubmitting}>
          {t(isSubmitting ? data.submittingKey : data.submitKey)}
        </button>
      </div>
      {fieldErrorKey ? (
        <p id={errorId} className={styles.error}>
          {t(fieldErrorKey)}
        </p>
      ) : null}
      {serverErrorKey ? (
        <p className={styles.error} role="alert">
          {t(serverErrorKey)}
        </p>
      ) : null}
      <div className={styles.answer} aria-live="polite">
        {answer ? (
          <>
            <span className={styles.answerLabel}>{t(data.answerKey)}</span>
            <strong className={styles.answerText}>{answer}</strong>
          </>
        ) : null}
      </div>
    </form>
  );
}
