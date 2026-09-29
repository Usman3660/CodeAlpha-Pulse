import { getCurrentUser, getUser, saveState, store } from '../state/store.js';
import { renderApp, renderFeed } from '../render/app.js';
import { showToast, triggerHeartBurst } from '../utils/ui.js';

export function toggleLike(postId, event) {
  const post = store.posts.find((entry) => entry.id === postId);
  if (!post) return;

  const idx = post.likes.indexOf(getCurrentUser().id);
  if (idx === -1) {
    post.likes.push(getCurrentUser().id);
    triggerHeartBurst(event);
  } else {
    post.likes.splice(idx, 1);
  }

  saveState();
  renderFeed();
  window.attachTiltPhysics?.();
}

export function submitComment(postId) {
  const post = store.posts.find((entry) => entry.id === postId);
  if (!post) return;

  const field = document.getElementById(`comment-field-${postId}`);
  const cleanVal = window.BackendSecurityLayer.validateComment(field.value);
  if (!cleanVal) return;

  post.comments ??= [];
  post.comments.push({
    id: 'c_' + Date.now(),
    authorId: getCurrentUser().id,
    content: cleanVal,
    timestamp: Date.now()
  });

  field.value = '';
  saveState();
  renderFeed();

  document.getElementById(`comment-drawer-${postId}`)?.classList.remove('hidden');
  window.attachTiltPhysics?.();
  showToast('Comment posted');
}

export function toggleCommentSection(postId) {
  document.getElementById(`comment-drawer-${postId}`)?.classList.toggle('hidden');
}

export function toggleFollowUser(targetUserId) {
  const currentUser = getCurrentUser();
  const targetUser = getUser(targetUserId);
  if (!targetUser) return;

  currentUser.following ??= [];
  targetUser.followers ??= [];

  const idx = currentUser.following.indexOf(targetUserId);
  if (idx === -1) {
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUser.id);
    showToast(`Following ${targetUser.name}`);
  } else {
    currentUser.following.splice(idx, 1);
    const followerIdx = targetUser.followers.indexOf(currentUser.id);
    if (followerIdx !== -1) targetUser.followers.splice(followerIdx, 1);
    showToast(`Unfollowed ${targetUser.name}`);
  }

  saveState();
  renderApp();

  const modal = document.getElementById('profileModal');
  if (modal && !modal.classList.contains('hidden')) {
    window.openProfileModal?.(targetUserId);
  }
}

export function handleSharePost(postId) {
  const fakeUrl = `${window.location.origin}/pulse/${postId}`;
  const temp = document.createElement('input');
  temp.value = fakeUrl;
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand('copy');
    showToast('Link copied to clipboard');
  } catch (error) {
    showToast('Post shared');
  }
  document.body.removeChild(temp);
}

export function deletePost(postId) {
  store.posts = store.posts.filter((entry) => entry.id !== postId);
  saveState();
  renderApp();
  showToast('Pulse deleted');
}
