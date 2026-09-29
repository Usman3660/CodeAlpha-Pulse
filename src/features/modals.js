import { getCurrentUser, getUser, saveState, store } from '../state/store.js';
import { renderApp } from '../render/app.js';
import { showToast } from '../utils/ui.js';
import { BackendSecurityLayer } from '../utils/security.js';

export function openProfileModal(userId) {
  const user = getUser(userId);
  const currentUser = getCurrentUser();
  const isSelf = user.id === currentUser.id;
  const isFollowing = (currentUser.following || []).includes(user.id);

  document.getElementById('modalProfileBanner').style.backgroundImage = `url(${user.banner || ''})`;
  document.getElementById('modalProfileBanner').style.backgroundSize = 'cover';
  document.getElementById('modalProfileAvatar').src = user.avatar;
  document.getElementById('modalProfileName').innerText = user.name;
  document.getElementById('modalProfileHandle').innerText = user.handle;
  document.getElementById('modalProfileBio').innerText = user.bio;

  const userPosts = store.posts.filter((post) => post.authorId === user.id);
  document.getElementById('modalStatPosts').innerText = userPosts.length;
  document.getElementById('modalStatFollowers').innerText = (user.followers || []).length;
  document.getElementById('modalStatFollowing').innerText = (user.following || []).length;

  const actionsEl = document.getElementById('modalProfileActions');
  if (isSelf) {
    actionsEl.innerHTML = '<button class="px-4 py-1.5 rounded-xl border border-white/20 text-xs font-semibold text-white hover:bg-white/10 transition-colors">Current Identity</button>';
  } else {
    actionsEl.innerHTML = `
      <button 
        onclick="toggleFollowUser('${user.id}')"
        class="px-5 py-2 rounded-xl text-xs font-bold transition-all ${isFollowing ? 'bg-white/10 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400' : 'bg-gradient-to-r from-brand-600 to-coral-500 text-white shadow-glow-sm hover:opacity-90'}">
        ${isFollowing ? 'Following' : 'Follow'}
      </button>
    `;
  }

  const recentContainer = document.getElementById('modalUserRecentPosts');
  if (userPosts.length === 0) {
    recentContainer.innerHTML = '<div class="text-xs text-gray-500 py-3 text-center">No posts shared yet.</div>';
  } else {
    recentContainer.innerHTML = userPosts.map((post) => `
      <div class="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
        <div class="text-gray-300 line-clamp-2">${post.content}</div>
        <div class="text-[10px] text-gray-500 font-mono mt-1">${window.getRelativeTime(post.timestamp)} &bull; ${post.likes.length} likes</div>
      </div>
    `).join('');
  }

  document.getElementById('profileModal').classList.remove('hidden');
}

export function closeProfileModal() {
  document.getElementById('profileModal').classList.add('hidden');
}

export function openComposeModal() {
  document.getElementById('composeModal').classList.remove('hidden');
  document.getElementById('modalPostInput').focus();
}

export function closeComposeModal() {
  document.getElementById('composeModal').classList.add('hidden');
}

export function promptPhotoUploadModal() {
  store.modalAttachedImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
  document.getElementById('modalComposeImg').src = store.modalAttachedImage;
  document.getElementById('modalComposePreview').classList.remove('hidden');
}

export function attachGradientBannerModal() {
  store.modalAttachedImage = 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80';
  document.getElementById('modalComposeImg').src = store.modalAttachedImage;
  document.getElementById('modalComposePreview').classList.remove('hidden');
}

export function removeModalAttachedImage() {
  store.modalAttachedImage = '';
  document.getElementById('modalComposePreview').classList.add('hidden');
}

export function handleModalPublish() {
  const rawText = document.getElementById('modalPostInput').value;
  const auth = BackendSecurityLayer.validateAndAuthorizePost(rawText, store.modalAttachedImage);

  if (!auth.authorized) {
    showToast(auth.friendlyMessage);
    return;
  }

  const tagMatch = auth.sanitizedContent.match(/#(\w+)/);
  const extractedTag = tagMatch ? tagMatch[1] : '';

  store.posts.unshift({
    id: 'p_' + Date.now(),
    authorId: getCurrentUser().id,
    content: auth.sanitizedContent,
    image: store.modalAttachedImage || '',
    tag: extractedTag || 'Vibes',
    timestamp: Date.now(),
    likes: [],
    comments: []
  });

  document.getElementById('modalPostInput').value = '';
  removeModalAttachedImage();
  closeComposeModal();
  saveState();
  renderApp();
  showToast('Pulse published!');
}

export function openNotificationsModal() {
  const container = document.getElementById('notificationsList');
  container.innerHTML = `
    <div class="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5">
      <div class="w-8 h-8 rounded-full bg-coral-500/20 text-coral-400 flex items-center justify-center text-xs">
        <i class="fa-solid fa-heart"></i>
      </div>
      <div class="text-xs">
        <span class="font-bold text-white">Maya Chen</span> liked your pulse.
        <div class="text-[10px] text-gray-500 font-mono">12m ago</div>
      </div>
    </div>
    <div class="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5">
      <div class="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs">
        <i class="fa-solid fa-user-plus"></i>
      </div>
      <div class="text-xs">
        <span class="font-bold text-white">Liam Vance</span> started following you.
        <div class="text-[10px] text-gray-500 font-mono">1h ago</div>
      </div>
    </div>
  `;
  document.getElementById('notificationsModal').classList.remove('hidden');
}

export function closeNotificationsModal() {
  document.getElementById('notificationsModal').classList.add('hidden');
}
