"use client";

import type { Comment } from "@/types/comment";

interface CommentListProps {
  comments: Comment[];
  editingCommentId: string | null;
  editingContent: string;
  isSavingEdit: boolean;
  deletingCommentId: string | null;
  onStartEdit: (comment: Comment) => void;
  onCancelEdit: () => void;
  onChangeEditingContent: (value: string) => void;
  onSaveEdit: (commentId: string) => Promise<void>;
  onDeleteComment: (comment: Comment) => Promise<void>;
}

function formatCommentDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Fecha no disponible";
  }

  return parsedDate.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isEdited(comment: Comment) {
  return new Date(comment.updatedAt).getTime() > new Date(comment.createdAt).getTime();
}

export function CommentList({
  comments,
  editingCommentId,
  editingContent,
  isSavingEdit,
  deletingCommentId,
  onStartEdit,
  onCancelEdit,
  onChangeEditingContent,
  onSaveEdit,
  onDeleteComment,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
        No hay comentarios aún. ¡Sé el primero en comentar!
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => (
        <li
          key={comment._id}
          className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          {editingCommentId === comment._id ? (
            <div className="space-y-3">
              <textarea
                value={editingContent}
                onChange={(event) => onChangeEditingContent(event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void onSaveEdit(comment._id);
                  }}
                  disabled={isSavingEdit || editingContent.trim().length === 0}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  {isSavingEdit ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={isSavingEdit}
                  className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm leading-6 text-zinc-700">{comment.content}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
                    {formatCommentDate(comment.createdAt)}
                  </p>
                  {isEdited(comment) && (
                    <p className="text-xs font-medium text-zinc-400">
                      Editado: {formatCommentDate(comment.updatedAt)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onStartEdit(comment)}
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void onDeleteComment(comment);
                  }}
                  disabled={deletingCommentId === comment._id}
                  className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingCommentId === comment._id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
