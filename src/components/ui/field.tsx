import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/utils/cn";

/**
 * Field / FieldLabel / FieldError — shadcn's current form structure.
 *
 * Deliberately these primitives rather than the retired `FormField` render-prop
 * wrapper: composing a plain label and control keeps the aria wiring visible in
 * the markup instead of hidden inside an abstraction.
 */

export const fieldErrorId = (id: string): string => `${id}-error`;

export function Field({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("pt-7", className)} {...props} />;
}

interface FieldLabelProps extends ComponentProps<"label"> {
  htmlFor: string;
  required?: boolean;
}

export function FieldLabel({ className, required, children, ...props }: FieldLabelProps) {
  return (
    <label className={cn("tag mb-2", className)} {...props}>
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
    <p className="text-destructive font-data mt-2 flex gap-2 text-[0.78rem] leading-relaxed" id={id}>
      <span
        className="bg-destructive text-destructive-foreground mt-0.5 inline-flex h-4 w-4 flex-none
          items-center justify-center text-[0.7rem] font-bold"
        aria-hidden="true"
      >
        !
      </span>
      <span>{children}</span>
    </p>
  );
}
