export type TaskStatus = "pending" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  timeSpent: number;
  startedAt: number | null;
}
