export function createUser(data) {
  return {
    id: data.id,
    name: data.name,
    handle: data.handle,
    avatar: data.avatar || '',
    banner: data.banner || '',
    bio: data.bio || '',
    followers: Array.isArray(data.followers) ? data.followers : [],
    following: Array.isArray(data.following) ? data.following : []
  };
}

export function validateUser(user) {
  return Boolean(user?.id && user?.name && user?.handle);
}
