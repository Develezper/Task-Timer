import { NextResponse } from "next/server";
import { deleteTaskInRepository, findTaskByIdentifier, updateTaskInRepository } from "@/lib/task-repository";
import { isNonNegativeNumber, isTaskStatus } from "@/lib/task-utils";
import type { Task } from "@/types/task";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const task = await findTaskByIdentifier(id);

    if (!task) {
      return NextResponse.json({ message: "Tarea no encontrada." }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch {
    return NextResponse.json(
      { message: "No se pudo consultar la tarea." },
      { status: 500 },
    );
  }
}

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

    if (
      body.finishedAt !== null &&
      body.finishedAt !== undefined &&
      !isNonNegativeNumber(body.finishedAt)
    ) {
      return NextResponse.json(
        { message: "La fecha de finalizacion es invalida." },
        { status: 400 },
      );
    }

    const result = await updateTaskInRepository(id, {
      status: body.status,
      timeSpent: body.timeSpent,
      startedAt: body.startedAt ?? null,
      finishedAt: body.finishedAt ?? null,
    });

    if (!result) {
      return NextResponse.json({ message: "Tarea no encontrada." }, { status: 404 });
    }

    return NextResponse.json(result);
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
    const deleted = await deleteTaskInRepository(id);

    if (!deleted) {
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
