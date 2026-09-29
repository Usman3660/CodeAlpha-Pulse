export function createPost(data) {
  return {
    id: data.id,
    authorId: data.authorId,
    content: data.content || '',
    image: data.image || '',
    tag: data.tag || '',
    timestamp: data.timestamp || Date.now(),
    likes: Array.isArray(data.likes) ? data.likes : [],
    comments: Array.isArray(data.comments) ? data.comments : []
  };
}

export function validatePost(post) {
  return Boolean(post?.id && post?.authorId && post?.content);
}
