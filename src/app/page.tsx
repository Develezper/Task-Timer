"use client";

import { useEffect, useState } from "react";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import type { Task } from "@/types/task";

const STORAGE_KEY = "task-timer-app";

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

function isTaskList(value: unknown): value is Task[] {
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

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const storedTasks = window.localStorage.getItem(STORAGE_KEY);

        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks) as unknown;

          if (isTaskList(parsedTasks)) {
            setTasks(parsedTasks);
          }
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [isHydrated, tasks]);

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
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status: "pending",
      timeSpent: 0,
      startedAt: null,
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
  };

  const handleStartTask = (taskId: string) => {
    const startTime = Date.now();

    setCurrentTime(startTime);
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: "in_progress",
            startedAt: startTime,
          };
        }

        if (task.status === "in_progress" && task.startedAt !== null) {
          return {
            ...task,
            status: "pending",
            timeSpent: task.timeSpent + (startTime - task.startedAt),
            startedAt: null,
          };
        }

        return task;
      }),
    );
  };

  const handleFinishTask = (taskId: string) => {
    const finishTime = Date.now();

    setCurrentTime(finishTime);
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        const totalTime =
          task.startedAt === null
            ? task.timeSpent
            : task.timeSpent + (finishTime - task.startedAt);

        return {
          ...task,
          status: "done",
          timeSpent: totalTime,
          startedAt: null,
        };
      }),
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  };

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const activeTasks = tasks.filter((task) => task.status === "in_progress").length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-3">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-zinc-950">
            Task Timer
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Crea tareas, inicia una, finalizala y guarda el tiempo invertido.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-3">
            <dt className="text-xs font-medium text-zinc-500">Total</dt>
            <dd className="mt-1 text-xl font-bold">{totalTasks}</dd>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-3">
            <dt className="text-xs font-medium text-zinc-500">Pendientes</dt>
            <dd className="mt-1 text-xl font-bold">{pendingTasks}</dd>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-3">
            <dt className="text-xs font-medium text-zinc-500">En progreso</dt>
            <dd className="mt-1 text-xl font-bold">{activeTasks}</dd>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-3">
            <dt className="text-xs font-medium text-zinc-500">Finalizadas</dt>
            <dd className="mt-1 text-xl font-bold">{completedTasks}</dd>
          </div>
        </dl>
      </header>

      <TaskForm onCreateTask={handleCreateTask} />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-zinc-950">Mis tareas</h2>
          <p className="text-sm text-zinc-500">
            {activeTasks > 0 ? "1 tarea activa" : "Sin tareas activas"}
          </p>
        </div>

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
