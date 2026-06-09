export const locales = ["es", "en", "pt"] as const;
export const defaultLocale = "es";

export type AppLocale = (typeof locales)[number];
