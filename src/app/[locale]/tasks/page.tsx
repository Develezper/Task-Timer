import { redirect } from "next/navigation";

interface LocalizedTasksPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function LocalizedTasksPage({
  params,
}: LocalizedTasksPageProps) {
  const { locale } = await params;

  redirect(`/${locale}`);
}
