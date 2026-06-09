import { isTask, isTaskList } from "@/lib/task-utils";
import type { Task } from "@/types/task";

interface UpdateTaskInput {
  status: Task["status"];
  timeSpent: number;
  startedAt: number | null;
  finishedAt: number | null;
}

export async function getTasks() {
  const response = await fetch("/api/tasks", { cache: "no-store" });
  return parseTaskListResponse(response, "No se pudieron cargar las tareas.");
}

export async function getTaskById(taskId: string) {
  const response = await fetch(`/api/todolist/${encodeURIComponent(taskId)}`, {
    cache: "no-store",
  });

  return parseTaskResponse(response, "No se pudo cargar el detalle de la tarea.");
}

export async function createTask(title: string) {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  return parseTaskResponse(response, "No se pudo crear la tarea.");
}

export async function updateTask(taskIdentifier: string, input: UpdateTaskInput) {
  const response = await fetch(`/api/tasks/${encodeURIComponent(taskIdentifier)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return parseTaskResponse(response, "No se pudo actualizar la tarea.");
}

export async function deleteTask(taskIdentifier: string) {
  const response = await fetch(`/api/tasks/${encodeURIComponent(taskIdentifier)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "No se pudo eliminar la tarea."));
  }
}

async function parseTaskListResponse(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallbackMessage));
  }

  const data = (await response.json()) as unknown;

  if (!isTaskList(data)) {
    throw new Error("El formato de las tareas es invalido.");
  }

  return data;
}

async function parseTaskResponse(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallbackMessage));
  }

  const data = (await response.json()) as unknown;

  if (!isTask(data)) {
    throw new Error("El formato de la tarea es invalido.");
  }

  return data;
}

async function getErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
