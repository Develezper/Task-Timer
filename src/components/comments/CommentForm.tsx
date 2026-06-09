"use client";

import { memo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

interface CommentFormProps {
  isSubmitting: boolean;
  onSubmitComment: (content: string) => Promise<void>;
}

function CommentFormComponent({
  isSubmitting,
  onSubmitComment,
}: CommentFormProps) {
  const t = useTranslations("CommentForm");
  const [content, setContent] = useState("");
  const normalizedContent = content.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!normalizedContent) {
      return;
    }

    await onSubmitComment(normalizedContent);
    setContent("");
  };

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-zinc-950">{t("title")}</h3>
        <p className="text-sm text-zinc-500">{t("description")}</p>
      </div>

      <label className="sr-only" htmlFor="comment-content">
        {t("label")}
      </label>
      <textarea
        id="comment-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={t("placeholder")}
        rows={4}
        className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
      />

      <button
        type="submit"
        disabled={isSubmitting || normalizedContent.length === 0}
        className="min-h-11 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {isSubmitting ? t("saving") : t("submit")}
      </button>
    </form>
  );
}

export const CommentForm = memo(CommentFormComponent);
