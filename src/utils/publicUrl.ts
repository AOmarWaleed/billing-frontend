/**
 * Resolves a path to a static asset located in the `public/` folder into an
 * absolute URL that is anchored to the application's base path.
 *
 * Relative paths (e.g. `themes/dark/icons/home.svg`) break on nested routes
 * such as `/help/6`, because the browser resolves them against the current
 * URL. Anchoring them to `import.meta.env.BASE_URL` guarantees they always
 * resolve from the application root, regardless of the active route.
 */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = path.replace(/^\.?\//, "");
  return `${normalizedBase}${normalizedPath}`;
}
