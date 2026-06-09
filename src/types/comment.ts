export interface Comment {
  _id: string;
  todoId: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentInput {
  todoId: string;
  content: string;
}
