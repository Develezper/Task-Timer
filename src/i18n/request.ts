import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "@/i18n/config";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = hasLocale(locales, requestedLocale) ? requestedLocale : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
