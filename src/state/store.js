import { demoUsers, initialPosts } from '../data/seed.js';

const STORAGE_KEYS = {
  users: 'pulse_users_data',
  posts: 'pulse_posts_data',
  currentUserId: 'pulse_active_user_id'
};

export const store = {
  users: [],
  posts: [],
  currentUserId: 'u1',
  currentFeedTab: 'all',
  activeTagFilter: '',
  searchQuery: '',
  composerAttachedImage: '',
  modalAttachedImage: ''
};

export function loadState() {
  try {
    const savedUsers = localStorage.getItem(STORAGE_KEYS.users);
    const savedPosts = localStorage.getItem(STORAGE_KEYS.posts);
    const savedCurrent = localStorage.getItem(STORAGE_KEYS.currentUserId);

    store.users = savedUsers ? JSON.parse(savedUsers) : demoUsers;
    store.posts = savedPosts ? JSON.parse(savedPosts) : initialPosts;
    if (savedCurrent && store.users.some((user) => user.id === savedCurrent)) {
      store.currentUserId = savedCurrent;
    }
  } catch (error) {
    store.users = demoUsers;
    store.posts = initialPosts;
  }
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(store.users));
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(store.posts));
    localStorage.setItem(STORAGE_KEYS.currentUserId, store.currentUserId);
  } catch (error) {
    console.error('Storage error', error);
  }
}

export function getCurrentUser() {
  return store.users.find((user) => user.id === store.currentUserId) || store.users[0];
}

export function getUser(id) {
  return store.users.find((user) => user.id === id) || {
    id: 'ghost',
    name: 'Pulse Member',
    handle: '@pulse',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Active member on Pulse.'
  };
}
