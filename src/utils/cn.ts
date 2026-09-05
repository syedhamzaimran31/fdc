type ClassValue = string | false | null | undefined;

/**
 * Joins conditional class names. Deliberately dependency-free: this project
 * uses plain CSS with design tokens, so there are no Tailwind classes to merge
 * and `clsx` + `tailwind-merge` would be two dependencies doing one join.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
