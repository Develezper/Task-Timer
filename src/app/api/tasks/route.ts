import { NextResponse } from "next/server";
import { createTaskInRepository, listTasksFromRepository } from "@/lib/task-repository";

export async function GET() {
  try {
    const tasks = await listTasksFromRepository();
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json(
      { message: "No se pudieron consultar las tareas." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { title?: string };
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json(
        { message: "El titulo es obligatorio." },
        { status: 400 },
      );
    }

    const task = await createTaskInRepository(title);

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "No se pudo guardar la tarea." },
      { status: 500 },
    );
  }
}
