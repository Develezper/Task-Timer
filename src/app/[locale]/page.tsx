"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { createTask, deleteTask, getTasks, updateTask } from "@/services/tasks";
import type { Task } from "@/types/task";

function formatTime(totalMilliseconds: number) {
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function getElapsedTime(task: Task, currentTime: number) {
  if (task.status !== "in_progress" || task.startedAt === null) {
    return task.timeSpent;
  }

  if (currentTime <= task.startedAt) {
    return task.timeSpent;
  }

  return task.timeSpent + (currentTime - task.startedAt);
}

export default function LocalizedHomePage() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setError("");
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "No fue posible conectar con MongoDB.",
        );
      } finally {
        setIsHydrated(true);
      }
    };

    void loadTasks();
  }, []);

  useEffect(() => {
    const hasActiveTask = tasks.some((task) => task.status === "in_progress");

    if (!hasActiveTask) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [tasks]);

  const handleCreateTask = (title: string) => {
    void (async () => {
      try {
        setIsSaving(true);
        setError("");
        const newTask = await createTask(title);
        setTasks((currentTasks) => [newTask, ...currentTasks]);
      } catch (error) {
        setError(error instanceof Error ? error.message : "No se pudo crear la tarea.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleStartTask = (taskId: string) => {
    void (async () => {
      const startTime = Date.now();
      const previousTasks = tasks;
      const nextTasks = tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: "in_progress" as const,
            startedAt: startTime,
            finishedAt: null,
          };
        }

        if (task.status === "in_progress" && task.startedAt !== null) {
          return {
            ...task,
            status: "pending" as const,
            timeSpent: task.timeSpent + (startTime - task.startedAt),
            startedAt: null,
            finishedAt: null,
          };
        }

        return task;
      });

      try {
        setIsSaving(true);
        setError("");
        setCurrentTime(startTime);
        setTasks(nextTasks);

        const changedTasks = nextTasks.filter((task) => {
          const previousTask = previousTasks.find((item) => item.id === task.id);

          return (
            previousTask &&
            (previousTask.status !== task.status ||
              previousTask.timeSpent !== task.timeSpent ||
              previousTask.startedAt !== task.startedAt)
          );
        });

        const savedTasks = await Promise.all(
          changedTasks.map((task) =>
            updateTask(task.id, {
              status: task.status,
              timeSpent: task.timeSpent,
              startedAt: task.startedAt,
              finishedAt: task.finishedAt,
            }),
          ),
        );

        setTasks((currentTasks) =>
          currentTasks.map(
            (task) => savedTasks.find((savedTask) => savedTask.id === task.id) ?? task,
          ),
        );
      } catch (error) {
        setTasks(previousTasks);
        setError(error instanceof Error ? error.message : "No se pudo iniciar la tarea.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleFinishTask = (taskId: string) => {
    void (async () => {
      const finishTime = Date.now();
      const previousTasks = tasks;
      const nextTasks = tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        const totalTime =
          task.startedAt === null
            ? task.timeSpent
            : task.timeSpent + (finishTime - task.startedAt);

        return {
          ...task,
          status: "done" as const,
          timeSpent: totalTime,
          startedAt: null,
          finishedAt: finishTime,
        };
      });

      const updatedTask = nextTasks.find((task) => task.id === taskId);

      try {
        setIsSaving(true);
        setError("");
        setCurrentTime(finishTime);
        setTasks(nextTasks);

        const savedTask = await updateTask(taskId, {
          status: updatedTask?.status ?? "done",
          timeSpent: updatedTask?.timeSpent ?? 0,
          startedAt: updatedTask?.startedAt ?? null,
          finishedAt: updatedTask?.finishedAt ?? finishTime,
        });

        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === savedTask.id ? savedTask : task)),
        );
      } catch (error) {
        setTasks(previousTasks);
        setError(error instanceof Error ? error.message : "No se pudo finalizar la tarea.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleDeleteTask = (taskId: string) => {
    void (async () => {
      const previousTasks = tasks;

      try {
        setIsSaving(true);
        setError("");
        setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));

        await deleteTask(taskId);
      } catch (error) {
        setTasks(previousTasks);
        setError(error instanceof Error ? error.message : "No se pudo eliminar la tarea.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const activeTasks = tasks.filter((task) => task.status === "in_progress").length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-zinc-950">
              Task Timer
            </h1>
            <p className="mt-2 text-sm text-zinc-500">{t("description")}</p>
          </div>

          <nav className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">{t("languages")}:</span>
            <Link
              href="/es"
              className={`rounded-md px-2 py-1 ${
                locale === "es" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              ES
            </Link>
            <Link
              href="/en"
              className={`rounded-md px-2 py-1 ${
                locale === "en" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              EN
            </Link>
            <Link
              href="/pt"
              className={`rounded-md px-2 py-1 ${
                locale === "pt" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              PT
            </Link>
          </nav>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-3">
            <dt className="text-xs font-medium text-zinc-500">{t("total")}</dt>
            <dd className="mt-1 text-xl font-bold">{totalTasks}</dd>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-3">
            <dt className="text-xs font-medium text-zinc-500">{t("pending")}</dt>
            <dd className="mt-1 text-xl font-bold">{pendingTasks}</dd>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-3">
            <dt className="text-xs font-medium text-zinc-500">{t("inProgress")}</dt>
            <dd className="mt-1 text-xl font-bold">{activeTasks}</dd>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-3">
            <dt className="text-xs font-medium text-zinc-500">{t("done")}</dt>
            <dd className="mt-1 text-xl font-bold">{completedTasks}</dd>
          </div>
        </dl>
      </header>

      <TaskForm onCreateTask={handleCreateTask} />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-zinc-950">{t("myTasks")}</h2>
          <p className="text-sm text-zinc-500">
            {isSaving
              ? t("saving")
              : activeTasks > 0
                ? t("oneActiveTask")
                : t("noActiveTasks")}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isHydrated && (
          <TaskList
            tasks={tasks}
            getTaskTime={(task) => formatTime(getElapsedTime(task, currentTime))}
            onStartTask={handleStartTask}
            onFinishTask={handleFinishTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </section>
    </main>
  );
}
