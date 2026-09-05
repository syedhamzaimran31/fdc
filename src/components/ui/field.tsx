import type { ReactNode } from "react";

interface FieldProps {
  /** Must match the id of the control passed as children. */
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export const errorId = (id: string): string => `${id}-error`;

/**
 * Label, control and error message as one unit, so the aria wiring is written
 * once instead of on every input. The label is always visible: a placeholder
 * disappears the moment someone starts typing, which is exactly when they need
 * to check what the field was asking for.
 *
 * The asterisk is decorative — screen readers get the requirement from
 * `aria-required` on the control itself, not from a floating symbol.
 */
export function Field({ id, label, error, required, children }: FieldProps) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
        {required ? (
          <span className="field-required" aria-hidden="true">
            {" *"}
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="field-error" id={errorId(id)}>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
