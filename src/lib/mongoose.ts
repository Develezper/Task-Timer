import mongoose from "mongoose";

declare global {
  var __mongooseConnection__: Promise<typeof mongoose> | undefined;
}

export async function connectToMongoose() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "task_timer";

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (global.__mongooseConnection__) {
    return global.__mongooseConnection__;
  }

  global.__mongooseConnection__ = mongoose.connect(uri, {
    dbName,
  });

  return global.__mongooseConnection__;
}
