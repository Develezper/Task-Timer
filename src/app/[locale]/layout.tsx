import { NextIntlClientProvider } from "next-intl";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(locales, locale)) {
    notFound();
  }

  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
