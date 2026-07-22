export type ClassValue = string | number | null | undefined | false;

/**
 * Minimal `classnames` helper — joins truthy class values with a space.
 * Avoids pulling in an external dependency for a simple concatenation.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
