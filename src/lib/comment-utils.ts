import type { Comment } from "@/types/comment";

export function isCommentList(value: unknown): value is Comment[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((comment) => isComment(comment));
}

export function isComment(value: unknown): value is Comment {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<Comment>;

  return (
    typeof candidate._id === "string" &&
    typeof candidate.todoId === "string" &&
    typeof candidate.content === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
}

export function sanitizeComment(comment: Record<string, unknown>): Comment {
  const createdAt = normalizeDate(comment.createdAt);

  return {
    _id: serializeId(comment._id),
    todoId: serializeId(comment.todoId),
    content: String(comment.content ?? ""),
    createdAt,
    updatedAt: normalizeDate(comment.updatedAt ?? createdAt),
  };
}

function serializeId(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toString" in value &&
    typeof value.toString === "function"
  ) {
    return value.toString();
  }

  return "";
}

function normalizeDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  return new Date(0).toISOString();
}
