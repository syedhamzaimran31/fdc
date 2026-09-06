import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/utils/cn";

export const fieldErrorId = (id: string): string => `${id}-error`;

export function Field({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("pt-5", className)} {...props} />;
}

/**
 * Label left, error right, on one baseline. Keeping the error here rather than
 * under the control means the field's height does not change when a message
 * appears, so validating one field never shunts the rest of the form down.
 */
export function FieldHeader({ children }: { children: ReactNode }) {
  return <div className="mb-1 flex items-baseline justify-between gap-4">{children}</div>;
}

interface FieldLabelProps extends ComponentProps<"label"> {
  htmlFor: string;
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

/**
 * No icon: the message is words, so the state is carried by text rather than by
 * the red alone. Messages are kept short enough to stay on one line at 375px —
 * a wrapped message reintroduces the height change this layout avoids.
 */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p className="text-destructive font-data min-w-0 text-right text-xs leading-snug" id={id}>
      {children}
    </p>
  );
}
