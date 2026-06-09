import { ObjectId } from "mongodb";
import { getCommentsCollection, getTasksCollection } from "@/lib/mongodb";
import { buildTaskIdentifierFilter } from "@/lib/task-query";
import { sanitizeTask } from "@/lib/task-utils";

const COMMENT_LOOKUP_STAGES = [
  {
    $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "todoId",
      as: "taskComments",
    },
  },
  {
    $addFields: {
      commentCount: {
        $size: "$taskComments",
      },
    },
  },
  {
    $project: {
      taskComments: 0,
    },
  },
] as const;

export async function listTasksFromRepository() {
  const collection = await getTasksCollection();
  const tasks = await collection
    .aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      ...COMMENT_LOOKUP_STAGES,
    ])
    .toArray();

  return tasks.map((task) => sanitizeTask(task as Record<string, unknown>));
}

export async function findTaskByIdentifier(identifier: string) {
  const collection = await getTasksCollection();
  const [task] = await collection
    .aggregate([
      {
        $match: buildTaskIdentifierFilter(identifier),
      },
      ...COMMENT_LOOKUP_STAGES,
    ])
    .toArray();

  if (!task) {
    return null;
  }

  return sanitizeTask(task as Record<string, unknown>);
}

export async function createTaskInRepository(title: string) {
  const collection = await getTasksCollection();
  const now = Date.now();
  const task = {
    id: crypto.randomUUID(),
    title,
    status: "pending" as const,
    timeSpent: 0,
    startedAt: null,
    finishedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(task);

  return sanitizeTask({
    ...task,
    _id: result.insertedId,
    commentCount: 0,
  });
}

export async function updateTaskInRepository(
  identifier: string,
  input: {
    status: "pending" | "in_progress" | "done";
    timeSpent: number;
    startedAt: number | null;
    finishedAt: number | null;
  },
) {
  const collection = await getTasksCollection();
  const updatedTask = await collection.findOneAndUpdate(
    buildTaskIdentifierFilter(identifier),
    {
      $set: {
        ...input,
        updatedAt: Date.now(),
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedTask) {
    return null;
  }

  const task = sanitizeTask(updatedTask as Record<string, unknown>);
  return findTaskByIdentifier(task._id);
}

export async function deleteTaskInRepository(identifier: string) {
  const task = await findTaskByIdentifier(identifier);

  if (!task) {
    return false;
  }

  const collection = await getTasksCollection();
  const commentsCollection = await getCommentsCollection();

  await collection.deleteOne(buildTaskIdentifierFilter(identifier));
  await commentsCollection.deleteMany({
    todoId: new ObjectId(task._id),
  });

  return true;
}

export async function taskExistsById(identifier: string) {
  if (!ObjectId.isValid(identifier)) {
    return false;
  }

  const collection = await getTasksCollection();
  const task = await collection.findOne(
    { _id: new ObjectId(identifier) },
    { projection: { _id: 1 } },
  );

  return Boolean(task);
}
