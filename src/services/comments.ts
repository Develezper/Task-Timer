import { isComment, isCommentList } from "@/lib/comment-utils";
import type { CreateCommentInput } from "@/types/comment";

export async function getComments(todoId: string) {
  const response = await fetch(`/api/comments/${encodeURIComponent(todoId)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "No se pudieron cargar los comentarios."),
    );
  }

  const data = (await response.json()) as unknown;

  if (!isCommentList(data)) {
    throw new Error("El formato de los comentarios es invalido.");
  }

  return data;
}

export async function createComment(input: CreateCommentInput) {
  const response = await fetch("/api/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "No se pudo guardar el comentario."));
  }

  const data = (await response.json()) as unknown;

  if (!isComment(data)) {
    throw new Error("El formato del comentario es invalido.");
  }

  return data;
}

async function getErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
