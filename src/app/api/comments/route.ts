import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { sanitizeComment } from "@/lib/comment-utils";
import { connectToMongoose } from "@/lib/mongoose";
import { taskExistsById } from "@/lib/task-repository";
import { CommentModel } from "@/models/Comment";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      todoId?: string;
      content?: string;
    };

    const todoId = body.todoId?.trim();
    const content = body.content?.trim();

    if (!todoId || !Types.ObjectId.isValid(todoId)) {
      return NextResponse.json(
        { message: "La tarea asociada es invalida." },
        { status: 400 },
      );
    }

    if (!content) {
      return NextResponse.json(
        { message: "El comentario no puede estar vacio." },
        { status: 400 },
      );
    }

    const taskExists = await taskExistsById(todoId);

    if (!taskExists) {
      return NextResponse.json({ message: "Tarea no encontrada." }, { status: 404 });
    }

    await connectToMongoose();

    const comment = await CommentModel.create({
      todoId: new Types.ObjectId(todoId),
      content,
    });

    return NextResponse.json(
      sanitizeComment(comment.toObject() as unknown as Record<string, unknown>),
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "No se pudo guardar el comentario." },
      { status: 500 },
    );
  }
}
