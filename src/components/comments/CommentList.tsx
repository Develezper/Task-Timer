import type { Comment } from "@/types/comment";

interface CommentListProps {
  comments: Comment[];
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

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
        No hay comentarios aun. ¡Se el primero en comentar!
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
          <p className="text-sm leading-6 text-zinc-700">{comment.content}</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
            {formatCommentDate(comment.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
