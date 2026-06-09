import { Model, Schema, Types, model, models } from "mongoose";

export interface CommentDocument {
  todoId: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    todoId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Task",
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
  },
);

export const CommentModel: Model<CommentDocument> =
  (models.Comment as Model<CommentDocument> | undefined) ??
  model<CommentDocument>("Comment", commentSchema);
