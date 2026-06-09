"use client";

import { memo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

interface TaskFormProps {
  onCreateTask: (title: string) => void;
}

function TaskFormComponent({ onCreateTask }: TaskFormProps) {
  const t = useTranslations("TaskForm");
  const [title, setTitle] = useState("");
  const normalizedTitle = title.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (normalizedTitle.length === 0) {
      return;
    }

    onCreateTask(normalizedTitle);
    setTitle("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row"
    >
      <label className="sr-only" htmlFor="task-title">
        {t("label")}
      </label>
      <input
        id="task-title"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={t("placeholder")}
        className="min-h-11 flex-1 rounded-md border border-zinc-300 bg-transparent px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
      />
      <button
        type="submit"
        disabled={normalizedTitle.length === 0}
        className="min-h-11 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {t("submit")}
      </button>
    </form>
  );
}

export const TaskForm = memo(TaskFormComponent);
