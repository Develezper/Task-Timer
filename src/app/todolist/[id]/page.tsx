import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

interface TaskDetailRedirectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskDetailRedirectPage({
  params,
}: TaskDetailRedirectPageProps) {
  const { id } = await params;

  redirect(`/${defaultLocale}/todolist/${id}`);
}
