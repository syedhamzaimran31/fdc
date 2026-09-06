import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/utils/cn";

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center rounded-none transition-colors duration-200",
    "cursor-pointer disabled:cursor-not-allowed",
    "focus-visible:outline-primary focus-visible:outline-3 focus-visible:outline-offset-3",
  ),
  {
    variants: {
      variant: {
        // The page's one saturated field. Used for the single primary action.
        primary: cn(
          "bg-primary text-primary-foreground font-display font-bold uppercase tracking-[0.04em]",
          "hover:bg-primary-hover disabled:bg-muted-foreground disabled:cursor-progress",
        ),
        // A ruled text link, for the one secondary action on the page.
        link: cn(
          "text-primary font-data border-b-[1.5px] border-primary px-0",
          "hover:text-primary-hover hover:border-primary-hover",
        ),
      },
      size: {
        // 3.5rem keeps the primary action comfortably above the touch minimum.
        lg: "min-h-14 w-full px-4 py-4 text-base",
        // Text links still need a 44px target even though the ink is small.
        inline: "min-h-11 text-[0.8125rem]",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
