"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "@/services/comments";
import { getTaskById } from "@/services/tasks";
import type { Comment } from "@/types/comment";
import type { Task } from "@/types/task";

function formatTaskStatus(status: Task["status"], t: ReturnType<typeof useTranslations>) {
  if (status === "in_progress") {
    return t("inProgress");
  }

  if (status === "done") {
    return t("done");
  }

  return t("pending");
}

function formatTaskDate(
  value: number | null,
  locale: string,
  t: ReturnType<typeof useTranslations>,
) {
  if (value === null) {
    return t("notRecorded");
  }

  const date = new Date(value);

  return date.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function LocalizedTaskDetailPage() {
  const t = useTranslations("TaskDetailPage");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const taskId = typeof params.id === "string" ? params.id : "";
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!taskId) {
      return;
    }

    let isCancelled = false;

    const loadDetail = async () => {
      try {
        setIsLoading(true);
        setError("");
        const [taskData, commentData] = await Promise.all([
          getTaskById(taskId),
          getComments(taskId),
        ]);

        if (isCancelled) {
          return;
        }

        setTask(taskData);
        setComments(commentData);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setTask(null);
        setComments([]);
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el detalle de la tarea.",
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      isCancelled = true;
    };
  }, [taskId]);

  const handleCreateComment = async (content: string) => {
    if (!task) {
      return;
    }

    try {
      setIsSubmittingComment(true);
      setError("");
      const newComment = await createComment({
        todoId: task._id,
        content,
      });

      setComments((currentComments) => [...currentComments, newComment]);
      setTask((currentTask) =>
        currentTask
          ? {
              ...currentTask,
              commentCount: currentTask.commentCount + 1,
            }
          : currentTask,
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No se pudo guardar el comentario.",
      );
      throw error;
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(comment.content);
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleSaveEdit = async (commentId: string) => {
    const normalizedContent = editingContent.trim();

    if (!normalizedContent) {
      setError("El comentario no puede estar vacío.");
      return;
    }

    try {
      setIsSavingEdit(true);
      setError("");
      const updatedComment = await updateComment(commentId, {
        content: normalizedContent,
      });

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment._id === updatedComment._id ? updatedComment : comment,
        ),
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No se pudo actualizar el comentario.",
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    try {
      setDeletingCommentId(comment._id);
      setError("");
      await deleteComment(comment._id);

      setComments((currentComments) =>
        currentComments.filter((currentComment) => currentComment._id !== comment._id),
      );
      setTask((currentTask) =>
        currentTask
          ? {
              ...currentTask,
              commentCount: Math.max(0, currentTask.commentCount - 1),
            }
          : currentTask,
      );

      if (editingCommentId === comment._id) {
        setEditingCommentId(null);
        setEditingContent("");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No se pudo eliminar el comentario.",
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push(`/${locale}`)}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          {t("back")}
        </button>
        {task && (
          <p className="text-sm text-zinc-500">
            {task.commentCount === 1
              ? t("oneCommentRegistered")
              : t("manyCommentsRegistered", { count: task.commentCount })}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 shadow-sm">
          {t("loading")}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && task && (
        <>
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                  {formatTaskStatus(task.status, t)}
                </span>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
                    {task.title}
                  </h1>
                  <p className="mt-2 text-sm text-zinc-500">
                    {t("mongoId", { id: task._id })}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-950 px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-300">
                  {t("accumulatedTime")}
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {Math.floor(task.timeSpent / 1000)}s
                </p>
              </div>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-zinc-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {t("status")}
                </dt>
                <dd className="mt-2 text-base font-semibold text-zinc-950">
                  {formatTaskStatus(task.status, t)}
                </dd>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {t("startDate")}
                </dt>
                <dd className="mt-2 text-base font-semibold text-zinc-950">
                  {formatTaskDate(task.startedAt, locale, t)}
                </dd>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {t("endDate")}
                </dt>
                <dd className="mt-2 text-base font-semibold text-zinc-950">
                  {formatTaskDate(task.finishedAt, locale, t)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)]">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-zinc-950">
                  {t("commentsTitle")}
                </h2>
                <p className="text-sm text-zinc-500">{t("commentsDescription")}</p>
              </div>
              <CommentList
                comments={comments}
                editingCommentId={editingCommentId}
                editingContent={editingContent}
                isSavingEdit={isSavingEdit}
                deletingCommentId={deletingCommentId}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onChangeEditingContent={setEditingContent}
                onSaveEdit={handleSaveEdit}
                onDeleteComment={handleDeleteComment}
              />
            </div>

            <div>
              <CommentForm
                isSubmitting={isSubmittingComment}
                onSubmitComment={handleCreateComment}
              />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
