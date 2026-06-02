import { NextResponse } from "next/server";
import { getTasksCollection } from "@/lib/mongodb";
import { isNonNegativeNumber, isTaskStatus, sanitizeTask } from "@/lib/task-utils";
import type { Task } from "@/types/task";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Partial<Task>;

    if (!isTaskStatus(body.status)) {
      return NextResponse.json(
        { message: "El estado de la tarea es invalido." },
        { status: 400 },
      );
    }

    if (!isNonNegativeNumber(body.timeSpent)) {
      return NextResponse.json(
        { message: "El tiempo acumulado es invalido." },
        { status: 400 },
      );
    }

    if (
      body.startedAt !== null &&
      body.startedAt !== undefined &&
      !isNonNegativeNumber(body.startedAt)
    ) {
      return NextResponse.json(
        { message: "La fecha de inicio es invalida." },
        { status: 400 },
      );
    }

    const collection = await getTasksCollection();

    const result = await collection.findOneAndUpdate(
      { id },
      {
        $set: {
          status: body.status,
          timeSpent: body.timeSpent,
          startedAt: body.startedAt ?? null,
          updatedAt: Date.now(),
        },
      },
      {
        returnDocument: "after",
        projection: { _id: 0 },
      },
    );

    if (!result) {
      return NextResponse.json({ message: "Tarea no encontrada." }, { status: 404 });
    }

    return NextResponse.json(sanitizeTask(result as Record<string, unknown>));
  } catch {
    return NextResponse.json(
      { message: "No se pudo actualizar la tarea." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const collection = await getTasksCollection();
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Tarea no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "No se pudo eliminar la tarea." },
      { status: 500 },
    );
  }
}
