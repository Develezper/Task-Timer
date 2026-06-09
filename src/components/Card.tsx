"use client";

import { useRouter } from "next/navigation";
import type { TaskStatus } from "@/types/task";

interface CardProps {
  taskId: string;
  title: string;
  status: TaskStatus;
  time: string;
  commentCount: number;
  onStart: () => void;
  onFinish: () => void;
  onDelete: () => void;
}

const statusMap: Record<
  TaskStatus,
  {
    badge: string;
    label: string;
  }
> = {
  pending: {
    badge: "task-status-pending",
    label: "Pending",
  },
  in_progress: {
    badge: "task-status-in-progress",
    label: "In Progress",
  },
  done: {
    badge: "task-status-done",
    label: "Done",
  },
};

export function Card({
  taskId,
  title,
  status,
  time,
  commentCount,
  onStart,
  onFinish,
  onDelete,
}: CardProps) {
  const router = useRouter();
  const { badge, label } = statusMap[status];
  const commentLabel =
    commentCount === 1 ? "1 comentario" : `${commentCount} comentarios`;

  return (
    <article
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex text-xs font-semibold ${badge}`}
          >
            {label}
          </span>
          <h3 className="mt-3 break-words text-base font-semibold text-zinc-950">
            {title}
          </h3>
          <p className="mt-2 text-sm text-zinc-500">{commentLabel}</p>
          <p className="mt-3 text-sm text-zinc-500">Tiempo invertido</p>
          <p className="text-2xl font-bold tabular-nums text-zinc-950">{time}</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => router.push(`/todolist/${taskId}`)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Ver detalles
          </button>

          {status === "pending" && (
            <button
              type="button"
              onClick={onStart}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Iniciar
            </button>
          )}

          {status === "in_progress" && (
            <button
              type="button"
              onClick={onFinish}
              className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              Finalizar
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            className="task-delete-button rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-red-50"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}
