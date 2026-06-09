export type TaskStatus = "pending" | "in_progress" | "done";

export interface Task {
  _id: string;
  id: string;
  title: string;
  status: TaskStatus;
  timeSpent: number;
  startedAt: number | null;
  finishedAt: number | null;
  commentCount: number;
}
