"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/Card";
import type { Task } from "@/types/task";

interface TaskListProps {
  tasks: Task[];
  getTaskTime: (task: Task) => string;
  onStartTask: (taskId: string) => void;
  onFinishTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

function TaskListComponent({
  tasks,
  getTaskTime,
  onStartTask,
  onFinishTask,
  onDeleteTask,
}: TaskListProps) {
  const t = useTranslations("TaskList");

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
        {t("empty")}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <Card
            taskId={task._id}
            title={task.title}
            status={task.status}
            time={getTaskTime(task)}
            commentCount={task.commentCount}
            onStart={() => onStartTask(task.id)}
            onFinish={() => onFinishTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
          />
        </li>
      ))}
    </ul>
  );
}

export const TaskList = memo(TaskListComponent);
