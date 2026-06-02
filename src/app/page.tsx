"use client";

import { useEffect, useState } from "react";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { isTaskList } from "@/lib/task-utils";
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

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setError("");
        const response = await fetch("/api/tasks", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("No se pudieron cargar las tareas.");
        }

        const data = (await response.json()) as unknown;

        if (isTaskList(data)) {
          setTasks(data);
        } else {
          throw new Error("El formato de las tareas es invalido.");
        }
      } catch {
        setError("No fue posible conectar con MongoDB.");
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
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        });

        if (!response.ok) {
          throw new Error("No se pudo crear la tarea.");
        }

        const newTask = (await response.json()) as Task;
        setTasks((currentTasks) => [newTask, ...currentTasks]);
      } catch {
        setError("No se pudo crear la tarea.");
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
          };
        }

        if (task.status === "in_progress" && task.startedAt !== null) {
          return {
            ...task,
            status: "pending" as const,
            timeSpent: task.timeSpent + (startTime - task.startedAt),
            startedAt: null,
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

        const responses = await Promise.all(
          changedTasks.map((task) =>
            fetch(`/api/tasks/${task.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: task.status,
                timeSpent: task.timeSpent,
                startedAt: task.startedAt,
              }),
            }),
          ),
        );

        if (responses.some((response) => !response.ok)) {
          throw new Error("No se pudo iniciar la tarea.");
        }
      } catch {
        setTasks(previousTasks);
        setError("No se pudo iniciar la tarea.");
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
        };
      });

      const updatedTask = nextTasks.find((task) => task.id === taskId);

      try {
        setIsSaving(true);
        setError("");
        setCurrentTime(finishTime);
        setTasks(nextTasks);

        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: updatedTask?.status,
            timeSpent: updatedTask?.timeSpent,
            startedAt: updatedTask?.startedAt,
          }),
        });

        if (!response.ok) {
          throw new Error("No se pudo finalizar la tarea.");
        }
      } catch {
        setTasks(previousTasks);
        setError("No se pudo finalizar la tarea.");
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

        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("No se pudo eliminar la tarea.");
        }
      } catch {
        setTasks(previousTasks);
        setError("No se pudo eliminar la tarea.");
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
            {isSaving
              ? "Guardando cambios..."
              : activeTasks > 0
                ? "1 tarea activa"
                : "Sin tareas activas"}
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
