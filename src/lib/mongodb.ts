import { MongoClient } from "mongodb";

declare global {
  var __mongoClientPromise__: Promise<MongoClient> | undefined;
}

function getClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  let client: MongoClient;

  if (process.env.NODE_ENV === "development") {
    if (!global.__mongoClientPromise__) {
      client = new MongoClient(uri);
      global.__mongoClientPromise__ = client.connect();
    }

    return global.__mongoClientPromise__;
  }

  client = new MongoClient(uri);
  return client.connect();
}

export async function getTasksCollection() {
  const mongoClient = await getClientPromise();
  const dbName = process.env.MONGODB_DB || "task_timer";

  return mongoClient.db(dbName).collection("tasks");
}
