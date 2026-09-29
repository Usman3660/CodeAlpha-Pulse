import { apiClient } from '../api/apiClient.js';

const listeners = new Set();

export const state = {
  users: [],
  posts: [],
  currentUserId: localStorage.getItem('pulse_active_user_id') || 'u1',
  currentTab: 'all',
  searchQuery: '',
  activeTag: '',
  composerImage: '',
  modalImage: '',
  view: 'feed'
};

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notify() {
  for (const listener of listeners) listener(state);
}

export function setState(patch) {
  Object.assign(state, patch);
  notify();
}

export function getCurrentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || state.users[0];
}

export async function loadBootstrap() {
  const [usersResponse, postsResponse] = await Promise.all([
    apiClient.get('/api/v1/users'),
    apiClient.get('/api/v1/posts')
  ]);

  state.users = usersResponse.data;
  state.posts = postsResponse.data;
  if (!state.users.some((user) => user.id === state.currentUserId)) {
    state.currentUserId = state.users[0]?.id || 'u1';
  }
  localStorage.setItem('pulse_active_user_id', state.currentUserId);
  notify();
}

export function persistActiveUser(id) {
  state.currentUserId = id;
  localStorage.setItem('pulse_active_user_id', id);
  notify();
}
