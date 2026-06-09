import { ObjectId } from "mongodb";

export function buildTaskIdentifierFilter(identifier: string) {
  if (ObjectId.isValid(identifier)) {
    return { _id: new ObjectId(identifier) };
  }

  return { id: identifier };
}
