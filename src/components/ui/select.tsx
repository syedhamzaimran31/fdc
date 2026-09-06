"use client";

import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";
import * as SelectPrimitive from "@radix-ui/react-select";
import type { ComponentProps } from "react";

import { cn } from "@/utils/cn";

/**
 * Radix Select, styled to match the ruled fields.
 *
 * A native <select> cannot be styled consistently across browsers, and its
 * default chrome is a large part of what makes a form read as templated. Radix
 * gives the same keyboard behaviour and aria semantics with the type control
 * the rest of the page needs.
 *
 * Icons are Phosphor, not Lucide — one icon family across the project.
 */

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "border-border-strong flex h-12 w-full items-center justify-between",
        "rounded-none border-0 border-b-[1.5px] bg-transparent px-0 py-2",
        "text-left text-[1.0625rem] text-foreground",
        "transition-colors duration-200",
        "data-[placeholder]:text-muted-foreground/70",
        "hover:border-b-foreground",
        "focus:border-b-primary focus:border-b-[2.5px] focus:outline-none",
        "focus-visible:outline-primary focus-visible:outline-3 focus-visible:outline-offset-4",
        "aria-invalid:border-b-destructive",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <CaretDownIcon className="text-foreground ml-2 size-4 flex-none" aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          "bg-surface border-foreground relative z-50 min-w-[var(--radix-select-trigger-width)]",
          "overflow-hidden rounded-none border",
          position === "popper" && "translate-y-1",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex min-h-11 w-full cursor-pointer items-center justify-between",
        "px-3 py-2 text-[1.0625rem] outline-none select-none",
        "data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator asChild>
        <CheckIcon className="ml-3 size-4 flex-none" aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
