import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { sanitizeComment } from "@/lib/comment-utils";
import { connectToMongoose } from "@/lib/mongoose";
import { taskExistsById } from "@/lib/task-repository";
import { CommentModel } from "@/models/Comment";

type RouteContext = {
  params: Promise<{
    todoId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { todoId } = await context.params;

    if (!Types.ObjectId.isValid(todoId)) {
      return NextResponse.json(
        { message: "La tarea asociada es invalida." },
        { status: 400 },
      );
    }

    const taskExists = await taskExistsById(todoId);

    if (!taskExists) {
      return NextResponse.json({ message: "Tarea no encontrada." }, { status: 404 });
    }

    await connectToMongoose();

    const comments = await CommentModel.find({
      todoId: new Types.ObjectId(todoId),
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(
      comments.map((comment) => sanitizeComment(comment as Record<string, unknown>)),
    );
  } catch {
    return NextResponse.json(
      { message: "No se pudieron consultar los comentarios." },
      { status: 500 },
    );
  }
}
