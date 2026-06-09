export interface Comment {
  _id: string;
  todoId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  todoId: string;
  content: string;
}

export interface UpdateCommentInput {
  content: string;
}
