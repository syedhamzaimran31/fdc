import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/utils/cn";

/**
 * Field / FieldLabel / FieldError — shadcn's current form structure.
 *
 * Deliberately these primitives rather than the retired `FormField` render-prop
 * wrapper: composing a plain label and control keeps the aria wiring visible in
 * the markup instead of hidden inside an abstraction.
 *
 * The error sits on the label's line, not under the control. Two reasons: the
 * message is next to the thing it names rather than a full field-height away
 * from it, and the field's height does not change when an error appears, so
 * validating one field never shunts the rest of the form down the page.
 */

export const fieldErrorId = (id: string): string => `${id}-error`;

export function Field({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("pt-5", className)} {...props} />;
}

interface FieldHeaderProps {
  children: ReactNode;
}

/** Label on the left, error on the right, sharing one baseline. */
export function FieldHeader({ children }: FieldHeaderProps) {
  return <div className="mb-1 flex items-baseline justify-between gap-3">{children}</div>;
}

interface FieldLabelProps extends ComponentProps<"label"> {
  htmlFor: string;
  required?: boolean;
}

export function FieldLabel({ className, required, children, ...props }: FieldLabelProps) {
  return (
    <label className={cn("tag flex-none", className)} {...props}>
      {children}
      {/* Decorative: the requirement itself is announced via aria-required on
          the control, so the asterisk is hidden from assistive tech. */}
      {required ? (
        <span className="text-primary" aria-hidden="true">
          {" *"}
        </span>
      ) : null}
    </label>
  );
}

interface FieldErrorProps {
  id: string;
  children: ReactNode;
}

/**
 * The filled marker carries the same meaning as the colour, so an error is
 * never signalled by hue alone.
 */
export function FieldError({ id, children }: FieldErrorProps) {
  return (
    <p
      className="text-destructive font-data flex min-w-0 items-baseline justify-end gap-1.5
        text-right text-xs leading-snug"
      id={id}
    >
      <span
        className="bg-destructive text-destructive-foreground inline-flex size-3.5 flex-none
          translate-y-0.5 items-center justify-center text-[0.65rem] leading-none font-bold"
        aria-hidden="true"
      >
        !
      </span>
      <span>{children}</span>
    </p>
  );
}
