import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { sanitizeComment } from "@/lib/comment-utils";
import { connectToMongoose } from "@/lib/mongoose";
import { CommentModel } from "@/models/Comment";

type RouteContext = {
  params: Promise<{
    commentId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { commentId } = await context.params;
    const body = (await request.json()) as {
      content?: string;
    };
    const content = body.content?.trim();

    if (!Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { message: "El comentario es invalido." },
        { status: 400 },
      );
    }

    if (!content) {
      return NextResponse.json(
        { message: "El comentario no puede estar vacio." },
        { status: 400 },
      );
    }

    await connectToMongoose();

    const comment = await CommentModel.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content,
        },
      },
      {
        new: true,
      },
    );

    if (!comment) {
      return NextResponse.json(
        { message: "Comentario no encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      sanitizeComment(comment.toObject() as unknown as Record<string, unknown>),
    );
  } catch {
    return NextResponse.json(
      { message: "No se pudo actualizar el comentario." },
      { status: 500 },
    );
  }
}
