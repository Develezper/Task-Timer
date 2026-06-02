import { NextResponse } from "next/server";
import { getTasksCollection } from "@/lib/mongodb";
import { sanitizeTask } from "@/lib/task-utils";
import type { Task } from "@/types/task";

export async function GET() {
  try {
    const collection = await getTasksCollection();
    const tasks = await collection
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      tasks.map((task) => sanitizeTask(task as Record<string, unknown>)),
    );
  } catch {
    return NextResponse.json(
      { message: "No se pudieron consultar las tareas." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Task>;
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json(
        { message: "El titulo es obligatorio." },
        { status: 400 },
      );
    }

    const now = Date.now();
    const task: Task & { createdAt: number; updatedAt: number } = {
      id: crypto.randomUUID(),
      title,
      status: "pending",
      timeSpent: 0,
      startedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const collection = await getTasksCollection();
    await collection.insertOne(task);

    return NextResponse.json(sanitizeTask(task as unknown as Record<string, unknown>), {
      status: 201,
    });
  } catch {
    return NextResponse.json(
      { message: "No se pudo guardar la tarea." },
      { status: 500 },
    );
  }
}
