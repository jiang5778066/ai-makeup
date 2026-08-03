export const locales = ["en", "zh-CN"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

const localeSet = new Set<string>(locales);

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && localeSet.has(value));
}

export function toLocale(value: string | null | undefined): Locale {
  const candidate = value ?? undefined;
  if (isLocale(candidate)) {
    return candidate;
  }
  return defaultLocale;
}

export function getLocaleFromSegments(segments: string[] = []): Locale {
  const [first] = segments;
  return isLocale(first) ? first : defaultLocale;
}

export function stripLocaleFromSegments(segments: string[] = []): string[] {
  const [first, ...rest] = segments;
  return isLocale(first) ? rest : segments;
}

export function localizePath(path: string, locale: Locale): string {
  const cleanPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) {
    return cleanPath || "/";
  }
  return cleanPath ? `/${locale}${cleanPath}` : `/${locale}`;
}

export function alternateLanguagesForPath(path: string): Record<Locale, string> {
  return locales.reduce(
    (alternates, locale) => ({
      ...alternates,
      [locale]: localizePath(path, locale)
    }),
    {} as Record<Locale, string>
  );
}

export function pathWithoutLocale(segments: string[] = []): string {
  const contentSegments = stripLocaleFromSegments(segments);
  return contentSegments.length ? `/${contentSegments.join("/")}` : "/";
}
