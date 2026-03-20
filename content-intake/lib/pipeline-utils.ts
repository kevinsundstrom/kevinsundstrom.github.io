const SLUG_RE = /^[a-z0-9-]+$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && slug.length > 0 && slug.length <= 100;
}

export function isValidPrNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}
