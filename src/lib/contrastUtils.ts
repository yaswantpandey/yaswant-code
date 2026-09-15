/**
 * Theme & Contrast Helper Utilities
 * 
 * Provides predefined, verified contrast-safe class strings and helpers
 * to prevent accidental white-on-white or low-contrast text across light and dark modes.
 */

export const contrastStyles = {
  // Container & Card Surfaces
  card: "contrast-card shadow-2xs",
  cardElevated: "contrast-card-elevated shadow-2xs",
  cardSubtle: "contrast-card-subtle",

  // Headings & Text
  heading: "contrast-heading font-bold",
  body: "contrast-body",
  muted: "contrast-muted",
  subtle: "contrast-subtle",

  // Form Controls
  input: "contrast-input px-3.5 py-2 text-xs rounded-xl focus:outline-none",
  select: "contrast-input px-3 py-1.5 text-xs rounded-lg focus:outline-none",
  
  // Borders
  border: "contrast-border",

  // Tailwind atomic utilities with explicit dark: pairings for quick composition
  tailwind: {
    card: "bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-800",
    cardElevated: "bg-neutral-50 dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-750",
    heading: "text-neutral-950 dark:text-white font-bold",
    body: "text-neutral-800 dark:text-neutral-200",
    muted: "text-neutral-600 dark:text-neutral-400",
    subtle: "text-neutral-500 dark:text-neutral-400 font-mono",
    input: "bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-750 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-950 dark:focus:border-white",
  }
} as const;

/**
 * Utility function to combine class names safely
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
