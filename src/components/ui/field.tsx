import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/utils/cn";

/**
 * Field / FieldHeader / FieldLabel / FieldError — shadcn's current form
 * structure, rather than the retired `FormField` render-prop wrapper:
 * composing a plain label and control keeps the aria wiring visible in the
 * markup instead of hidden inside an abstraction.
 *
 * The error sits on the label's line. The message is next to the thing it
 * names rather than a full field-height away from it, and the field's height
 * does not change when an error appears, so validating one field never shunts
 * the rest of the form down the page.
 *
 * There is no error icon. The message is words — "Enter a valid email" — so
 * the information is carried by text, not by the red alone, which is what
 * WCAG 1.4.1 actually asks for. An icon on top of that was decoration, and at
 * this size it read as a warning triangle glued to the label.
 *
 * No per-field asterisk either: every field on this form is required, so the
 * form says that once above the first field instead of repeating a symbol four
 * times. `aria-required` still goes on each control, so assistive tech is told
 * per field regardless.
 */

export const fieldErrorId = (id: string): string => `${id}-error`;

export function Field({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("pt-5", className)} {...props} />;
}

/** Label left, error right, sharing one baseline. */
export function FieldHeader({ children }: { children: ReactNode }) {
  return <div className="mb-1 flex items-baseline justify-between gap-4">{children}</div>;
}

interface FieldLabelProps extends ComponentProps<"label"> {
  htmlFor: string;
  /** Turns the label the error colour so the whole field reads as one unit. */
  invalid?: boolean;
}

export function FieldLabel({ className, invalid, children, ...props }: FieldLabelProps) {
  return (
    <label
      className={cn("tag flex-none transition-colors", invalid && "text-destructive", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p className="text-destructive font-data min-w-0 text-right text-xs leading-snug" id={id}>
      {children}
    </p>
  );
}
