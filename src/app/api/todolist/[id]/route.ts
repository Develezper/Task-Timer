import { NextResponse } from "next/server";
import { findTaskByIdentifier } from "@/lib/task-repository";

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
