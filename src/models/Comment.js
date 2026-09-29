export function createComment(data) {
  return {
    id: data.id,
    authorId: data.authorId,
    content: data.content || '',
    timestamp: data.timestamp || Date.now()
  };
}

export function validateComment(comment) {
  return Boolean(comment?.id && comment?.authorId && comment?.content);
}
