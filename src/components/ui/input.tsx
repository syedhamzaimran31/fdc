import type { ComponentProps } from "react";

import { cn } from "@/utils/cn";

/** h-11 is deliberate: the 44px touch minimum, and no taller. */
export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "border-border-strong h-11 w-full rounded-none border-0 border-b-[1.5px]",
        "bg-transparent px-0 py-1 text-[1.0625rem] text-foreground",
        "placeholder:text-muted-foreground/70",
        "transition-colors duration-200",
        "hover:border-b-foreground",
        "focus:border-b-primary focus:border-b-[2.5px] focus:outline-none",
        "focus-visible:outline-primary focus-visible:outline-3 focus-visible:outline-offset-4",
        "aria-invalid:border-b-destructive",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
