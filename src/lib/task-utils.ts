import type { Task } from "@/types/task";

const TASK_STATUSES: Task["status"][] = ["pending", "in_progress", "done"];

export function isTaskList(value: unknown): value is Task[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((task) => {
    if (typeof task !== "object" || task === null) {
      return false;
    }

    const candidate = task as Partial<Task>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.title === "string" &&
      (candidate.status === "pending" ||
        candidate.status === "in_progress" ||
        candidate.status === "done") &&
      typeof candidate.timeSpent === "number" &&
      (typeof candidate.startedAt === "number" || candidate.startedAt === null)
    );
  });
}

export function sanitizeTask(task: Record<string, unknown>): Task {
  const status = isTaskStatus(task.status) ? task.status : "pending";
  const timeSpent = isNonNegativeNumber(task.timeSpent) ? task.timeSpent : 0;

  return {
    id: String(task.id ?? ""),
    title: String(task.title ?? ""),
    status,
    timeSpent,
    startedAt: typeof task.startedAt === "number" ? task.startedAt : null,
  };
}

export function isTaskStatus(value: unknown): value is Task["status"] {
  return typeof value === "string" && TASK_STATUSES.includes(value as Task["status"]);
}

export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
