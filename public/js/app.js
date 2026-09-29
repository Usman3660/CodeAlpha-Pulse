import { apiClient } from './api/apiClient.js';
import { attachTilt3D } from './effects/tilt3d.js';
import { startBackgroundScene } from './effects/threeBackground.js';
import { loadBootstrap, persistActiveUser, state, subscribe, setState, getCurrentUser } from './state/store.js';
import { renderComposer } from './components/composer.js';
import { renderProfileSwitcher } from './components/profileSwitcher.js';
import { renderFeedShell } from './components/feed.js';
import { renderPostCard } from './components/postCard.js';

function formatTime(timestamp) {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function showToast(message) {
  const toast = document.getElementById('simpleToast');
  const text = document.getElementById('toastMessageText');
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  clearTimeout(window.__pulseToastTimer);
  window.__pulseToastTimer = setTimeout(() => {
    toast.classList.add('translate-y-24', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 2600);
}

function sanitize(text) {
  const element = document.createElement('div');
  element.textContent = text.trim();
  return element.innerHTML;
}

async function refreshPosts() {
  const response = await apiClient.get('/api/v1/posts');
  state.posts = response.data;
}

function filteredPosts() {
  const currentUser = getCurrentUser();
  let posts = [...state.posts];

  if (state.currentTab === 'following') {
    const following = currentUser.following || [];
    posts = posts.filter((post) => following.includes(post.authorId) || post.authorId === currentUser.id);
  } else if (state.currentTab === 'trending') {
    posts.sort((a, b) => (b.likes.length + (b.comments?.length || 0)) - (a.likes.length + (a.comments?.length || 0)));
  } else {
    posts.sort((a, b) => b.timestamp - a.timestamp);
  }

  if (state.activeTag) {
    posts = posts.filter((post) => post.tag && post.tag.toLowerCase() === state.activeTag.toLowerCase());
  }

  if (state.searchQuery.trim()) {
    const query = state.searchQuery.toLowerCase();
    posts = posts.filter((post) => {
      const author = state.users.find((user) => user.id === post.authorId);
      return (
        post.content.toLowerCase().includes(query) ||
        (post.tag && post.tag.toLowerCase().includes(query)) ||
        author?.name.toLowerCase().includes(query) ||
        author?.handle.toLowerCase().includes(query)
      );
    });
  }

  return posts;
}

function attachPostListeners() {
  const stream = document.getElementById('feedStreamContainer');
  if (!stream) return;

  stream.querySelectorAll('[data-profile]').forEach((button) => {
    button.onclick = () => openProfileModal(button.dataset.profile);
  });

  stream.querySelectorAll('[data-tag]').forEach((button) => {
    button.onclick = () => {
      state.activeTag = button.dataset.tag;
      updateFeedOnly();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  });

  stream.querySelectorAll('[data-like-post]').forEach((button) => {
    button.onclick = async () => {
      await apiClient.post(`/api/v1/posts/${button.dataset.likePost}/like`);
      await refreshPosts();
      updateFeedOnly();
    };
  });

  stream.querySelectorAll('[data-toggle-comments]').forEach((button) => {
    button.onclick = () => {
      document.getElementById(`comment-drawer-${button.dataset.toggleComments}`)?.classList.toggle('hidden');
    };
  });

  stream.querySelectorAll('[data-submit-comment]').forEach((button) => {
    button.onclick = async () => {
      const field = document.getElementById(`comment-field-${button.dataset.submitComment}`);
      if (!field || !field.value.trim()) return;
      await apiClient.post(`/api/v1/posts/${button.dataset.submitComment}/comments`, { content: sanitize(field.value) });
      field.value = '';
      await refreshPosts();
      updateFeedOnly();
      document.getElementById(`comment-drawer-${button.dataset.submitComment}`)?.classList.remove('hidden');
    };
  });

  stream.querySelectorAll('[data-share-post]').forEach((button) => {
    button.onclick = async () => {
      try {
        await navigator.clipboard.writeText(`${location.origin}/posts/${button.dataset.sharePost}`);
        showToast('Link copied to clipboard');
      } catch {
        showToast('Post shared');
      }
    };
  });

  stream.querySelectorAll('[data-delete-post]').forEach((button) => {
    button.onclick = async () => {
      await apiClient.del(`/api/v1/posts/${button.dataset.deletePost}`);
      await refreshPosts();
      updateFeedOnly();
      showToast('Pulse deleted');
    };
  });

  attachTilt3D();
}

function updateFeedOnly() {
  const posts = filteredPosts();
  const handlers = {
    formatTime,
    openProfile: openProfileModal
  };

  const stream = document.getElementById('feedStreamContainer');
  const emptyMessage = document.getElementById('emptyFeedMessage');
  const tagBanner = document.getElementById('hashtagPillBanner');
  const tagLabel = document.getElementById('activeHashtagLabel');
  const clearSearchBtn = document.querySelector('[data-clear-search]');

  if (clearSearchBtn) {
    if (state.searchQuery.trim()) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }
  }

  if (tagBanner && tagLabel) {
    if (state.activeTag) {
      tagLabel.textContent = state.activeTag;
      tagBanner.classList.remove('hidden');
    } else {
      tagBanner.classList.add('hidden');
    }
  }

  // Update filter tab button styles
  document.querySelectorAll('.filter-tab-btn').forEach((btn) => {
    const tab = btn.dataset.tab;
    if (tab === state.currentTab) {
      btn.className = 'filter-tab-btn flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm';
    } else {
      btn.className = 'filter-tab-btn flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-gray-400 hover:text-white';
    }
  });

  // Update sidebar nav items
  document.querySelectorAll('nav .nav-item').forEach((btn) => {
    const tab = btn.dataset.tab;
    if (tab === state.currentTab) {
      btn.className = 'nav-item w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl text-white bg-white/10 hover:bg-white/15 transition-all';
    } else {
      btn.className = 'nav-item w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all';
    }
  });

  if (stream) {
    stream.innerHTML = posts.length
      ? posts.map((post) => renderPostCard(post, state.users.find((user) => user.id === post.authorId), handlers)).join('')
      : '';
  }

  if (emptyMessage) {
    if (posts.length === 0) {
      emptyMessage.classList.remove('hidden');
    } else {
      emptyMessage.classList.add('hidden');
    }
  }

  attachPostListeners();
}

function renderApp() {
  const currentUser = getCurrentUser();
  const posts = filteredPosts();
  const feedState = {
    ...state,
    posts,
    handlers: {
      formatTime,
      openProfile: openProfileModal
    }
  };

  document.getElementById('app').innerHTML = `
    <div class="ambient-orb w-[500px] h-[500px] bg-brand-600 top-[-10%] left-[20%]"></div>
    <div class="ambient-orb w-[600px] h-[600px] bg-coral-500 bottom-[-10%] right-[10%]"></div>
    <div class="ambient-orb w-[400px] h-[400px] bg-sky-500 top-[40%] right-[30%] opacity-10"></div>

    <header class="md:hidden sticky top-0 z-40 w-full glass-box border-b border-white/10 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 via-coral-500 to-amber-400 flex items-center justify-center shadow-glow-sm">
          <i class="fa-solid fa-bolt text-white text-sm"></i>
        </div>
        <span class="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-100 bg-clip-text text-transparent">pulse</span>
      </div>
      <div class="flex items-center gap-3">
        <button data-open-compose class="w-8 h-8 rounded-full bg-gradient-to-r from-brand-600 to-coral-500 text-white flex items-center justify-center text-xs shadow-md"><i class="fa-solid fa-plus"></i></button>
        <button data-toggle-switcher class="w-8 h-8 rounded-full overflow-hidden border border-white/20"><img src="${currentUser.avatar}" class="w-full h-full object-cover" alt="User"></button>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 min-h-screen relative z-10 flex">
      <aside class="w-20 xl:w-64 flex-shrink-0 hidden md:flex flex-col justify-between py-6 sticky top-0 h-screen border-r border-white/10 pr-3 z-50">
        <div class="space-y-6">
          <div class="flex items-center gap-3 px-3 py-1 cursor-pointer" data-sidebar-brand>
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 via-coral-500 to-amber-400 p-[2px] shadow-glow-sm transform hover:scale-105 transition-transform">
              <div class="w-full h-full bg-[#0b0f19] rounded-2xl flex items-center justify-center">
                <i class="fa-solid fa-bolt text-base text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-coral-400"></i>
              </div>
            </div>
            <span class="hidden xl:inline font-extrabold text-2xl tracking-tight text-white">pulse</span>
          </div>

          <nav class="space-y-1.5 font-medium">
            <button data-nav-tab="all" class="nav-item w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl ${state.currentTab === 'all' ? 'text-white bg-white/10 hover:bg-white/15' : 'text-gray-400 hover:text-white hover:bg-white/5'} transition-all"><i class="fa-solid fa-house text-lg text-brand-500 w-6 text-center"></i><span class="hidden xl:inline text-sm font-semibold">Feed</span></button>
            <button data-nav-tab="trending" class="nav-item w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl ${state.currentTab === 'trending' ? 'text-white bg-white/10 hover:bg-white/15' : 'text-gray-400 hover:text-white hover:bg-white/5'} transition-all"><i class="fa-solid fa-fire text-lg text-coral-400 w-6 text-center"></i><span class="hidden xl:inline text-sm font-semibold">Trending</span></button>
            <button data-nav-tab="following" class="nav-item w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl ${state.currentTab === 'following' ? 'text-white bg-white/10 hover:bg-white/15' : 'text-gray-400 hover:text-white hover:bg-white/5'} transition-all"><i class="fa-solid fa-user-group text-lg text-sky-400 w-6 text-center"></i><span class="hidden xl:inline text-sm font-semibold">Following</span></button>
            <button data-open-notifications class="w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all relative"><i class="fa-regular fa-bell text-lg text-amber-400 w-6 text-center"></i><span class="hidden xl:inline text-sm font-semibold">Notifications</span><span class="absolute top-2.5 left-7 w-2 h-2 rounded-full bg-coral-500"></span></button>
            <button data-open-profile="${currentUser.id}" class="w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"><i class="fa-regular fa-user text-lg text-mint-400 w-6 text-center"></i><span class="hidden xl:inline text-sm font-semibold">Profile</span></button>
          </nav>

          <button data-open-compose class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-coral-500 to-brand-500 hover:opacity-95 text-white font-bold text-sm shadow-glow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"><i class="fa-solid fa-pen-nib text-xs"></i><span class="hidden xl:inline">Create Post</span></button>
        </div>

        <div class="relative z-[90]" id="profileSwitcherDropdown">
          ${renderProfileSwitcher(currentUser, state.users)}
        </div>
      </aside>

      <main class="flex-1 max-w-2xl min-h-screen border-r border-white/10 py-6 px-3 sm:px-6 relative z-10">
        ${renderComposer(currentUser)}
        ${renderFeedShell(feedState)}
      </main>

      <aside class="w-80 flex-shrink-0 hidden lg:block py-6 pl-6 space-y-6 sticky top-0 h-screen overflow-y-auto">
        <div class="relative">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input type="text" id="globalSearchInput" placeholder="Search posts or creators..." class="w-full pl-9 pr-8 py-2.5 rounded-2xl glass-box text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-all" value="${state.searchQuery}">
          <button data-clear-search class="${state.searchQuery ? '' : 'hidden'} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="glass-box rounded-3xl p-4 sm:p-5 tilt-card">
          <div class="tilt-inner space-y-3">
            <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 class="font-bold text-sm text-white flex items-center gap-2"><i class="fa-solid fa-arrow-trend-up text-coral-400 text-xs"></i>Trending Topics</h3>
              <span class="text-[10px] text-gray-400 font-medium">Real-time</span>
            </div>
            <div id="trendingTopicsList" class="space-y-2.5 pt-1"></div>
          </div>
        </div>

        <div class="glass-box rounded-3xl p-4 sm:p-5 tilt-card">
          <div class="tilt-inner space-y-3">
            <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 class="font-bold text-sm text-white flex items-center gap-2"><i class="fa-solid fa-sparkles text-amber-400 text-xs"></i>Who to follow</h3>
              <button data-refresh-following class="text-[11px] text-brand-400 hover:underline">Refresh</button>
            </div>
            <div id="whoToFollowList" class="space-y-3 pt-1"></div>
          </div>
        </div>
      </aside>
    </div>

    <div id="profileModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div class="w-full max-w-lg glass-box rounded-3xl overflow-hidden shadow-2xl border border-white/15 relative"></div>
    </div>

    <div id="composeModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div class="w-full max-w-lg glass-box rounded-3xl p-6 shadow-2xl border border-white/15 relative">
        <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 class="font-bold text-base text-white">Create New Pulse</h3>
          <button data-close-compose class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-xs"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="space-y-4">
          <textarea id="modalPostInput" rows="4" placeholder="Share your thoughts, discoveries, or current project..." class="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500 resize-none"></textarea>
          <div id="modalComposePreview" class="hidden relative rounded-2xl overflow-hidden max-h-48 border border-white/10">
            <img id="modalComposeImg" src="" class="w-full h-full object-cover" alt="Preview">
            <button data-remove-modal-image class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center text-xs"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center gap-2">
              <button data-modal-photo class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-400 text-sm"><i class="fa-regular fa-image"></i></button>
              <button data-modal-vibe class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-coral-400 text-sm"><i class="fa-solid fa-palette"></i></button>
            </div>
            <button data-modal-publish class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-coral-500 text-white text-xs font-bold shadow-glow-sm hover:opacity-95">Publish Pulse</button>
          </div>
        </div>
      </div>
    </div>

    <div id="notificationsModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div class="w-full max-w-md glass-box rounded-3xl p-6 shadow-2xl border border-white/15">
        <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 class="font-bold text-base text-white">Notifications</h3>
          <button data-close-notifications class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-xs"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="notificationsList" class="space-y-3"></div>
      </div>
    </div>

    <div id="simpleToast" class="fixed bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 flex items-center gap-3 px-4 py-3 rounded-2xl glass-box border border-white/15 shadow-2xl text-xs max-w-sm pointer-events-none">
      <div id="toastDot" class="w-2.5 h-2.5 rounded-full bg-brand-500"></div>
      <span id="toastMessageText" class="text-gray-200 font-medium">Action successful</span>
    </div>
  `;

  renderSidebarData(currentUser);
  bindEvents();
  attachPostListeners();
}

function bindEvents() {
  document.querySelectorAll('[data-sidebar-brand]').forEach((btn) => {
    btn.onclick = () => {
      state.currentTab = 'all';
      state.activeTag = '';
      state.searchQuery = '';
      const input = document.getElementById('globalSearchInput');
      if (input) input.value = '';
      updateFeedOnly();
    };
  });

  document.querySelectorAll('[data-nav-tab]').forEach((button) => {
    button.onclick = () => {
      state.currentTab = button.dataset.navTab;
      updateFeedOnly();
    };
  });

  document.querySelectorAll('.filter-tab-btn').forEach((button) => {
    button.onclick = () => {
      state.currentTab = button.dataset.tab;
      updateFeedOnly();
    };
  });

  document.querySelectorAll('[data-open-compose]').forEach((button) => {
    button.onclick = () => document.getElementById('composeModal').classList.remove('hidden');
  });

  document.querySelectorAll('[data-close-compose]').forEach((button) => {
    button.onclick = () => document.getElementById('composeModal').classList.add('hidden');
  });

  document.querySelectorAll('[data-open-notifications]').forEach((button) => {
    button.onclick = () => {
      const list = document.getElementById('notificationsList');
      list.innerHTML = `
        <div class="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5">
          <div class="w-8 h-8 rounded-full bg-coral-500/20 text-coral-400 flex items-center justify-center text-xs"><i class="fa-solid fa-heart"></i></div>
          <div class="text-xs"><span class="font-bold text-white">Maya Chen</span> liked your pulse.<div class="text-[10px] text-gray-500 font-mono">12m ago</div></div>
        </div>
      `;
      document.getElementById('notificationsModal').classList.remove('hidden');
    };
  });

  document.querySelectorAll('[data-close-notifications]').forEach((button) => {
    button.onclick = () => document.getElementById('notificationsModal').classList.add('hidden');
  });

  document.querySelectorAll('[data-toggle-switcher]').forEach((button) => {
    button.onclick = () => document.getElementById('userSwitcherMenu')?.classList.toggle('hidden');
  });

  document.querySelectorAll('[data-refresh-following]').forEach((button) => {
    button.onclick = async () => {
      const response = await apiClient.get('/api/v1/users');
      state.users = response.data;
      renderSidebarData(getCurrentUser());
    };
  });

  document.querySelectorAll('[data-open-profile]').forEach((button) => {
    button.onclick = () => openProfileModal(button.dataset.openProfile);
  });

  // REALTIME LIVE SEARCH (smooth without page refresh or animation flicker)
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.oninput = (event) => {
      state.searchQuery = event.target.value;
      updateFeedOnly();
    };
  }

  document.querySelectorAll('[data-clear-search]').forEach((button) => {
    button.onclick = () => {
      state.searchQuery = '';
      const input = document.getElementById('globalSearchInput');
      if (input) input.value = '';
      updateFeedOnly();
      if (input) input.focus();
    };
  });

  document.querySelectorAll('[data-clear-tag]').forEach((button) => {
    button.onclick = () => {
      state.activeTag = '';
      updateFeedOnly();
    };
  });

  document.querySelectorAll('[data-photo-upload]').forEach((button) => {
    button.onclick = () => {
      const images = [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80'
      ];
      state.composerImage = images[Math.floor(Math.random() * images.length)];
      document.getElementById('composerAttachmentImg').src = state.composerImage;
      document.getElementById('composerAttachmentPreview').classList.remove('hidden');
    };
  });

  document.querySelectorAll('[data-vibe-upload]').forEach((button) => {
    button.onclick = () => {
      const images = [
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80'
      ];
      state.composerImage = images[Math.floor(Math.random() * images.length)];
      document.getElementById('composerAttachmentImg').src = state.composerImage;
      document.getElementById('composerAttachmentPreview').classList.remove('hidden');
    };
  });

  document.querySelectorAll('[data-remove-attached-image]').forEach((button) => {
    button.onclick = () => {
      state.composerImage = '';
      document.getElementById('composerAttachmentPreview').classList.add('hidden');
    };
  });

  document.querySelectorAll('[data-add-tag]').forEach((button) => {
    button.onclick = () => {
      const input = document.getElementById('mainPostInput');
      input.value += ' #Pulse';
      input.focus();
    };
  });

  document.querySelectorAll('[data-publish-post]').forEach((button) => {
    button.onclick = async () => {
      const content = sanitize(document.getElementById('mainPostInput').value || '');
      if (!content && !state.composerImage) return showToast('Please type something before sharing.');
      const tagMatch = content.match(/#(\w+)/);
      await apiClient.post('/api/v1/posts', {
        content,
        image: state.composerImage,
        tag: tagMatch ? tagMatch[1] : 'Vibes'
      });
      document.getElementById('mainPostInput').value = '';
      state.composerImage = '';
      document.getElementById('composerAttachmentPreview')?.classList.add('hidden');
      await refreshPosts();
      updateFeedOnly();
      renderSidebarData(getCurrentUser());
      showToast('Pulse published!');
    };
  });

  document.querySelectorAll('[data-modal-photo]').forEach((button) => {
    button.onclick = () => {
      state.modalImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
      document.getElementById('modalComposeImg').src = state.modalImage;
      document.getElementById('modalComposePreview').classList.remove('hidden');
    };
  });

  document.querySelectorAll('[data-modal-vibe]').forEach((button) => {
    button.onclick = () => {
      state.modalImage = 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80';
      document.getElementById('modalComposeImg').src = state.modalImage;
      document.getElementById('modalComposePreview').classList.remove('hidden');
    };
  });

  document.querySelectorAll('[data-remove-modal-image]').forEach((button) => {
    button.onclick = () => {
      state.modalImage = '';
      document.getElementById('modalComposePreview').classList.add('hidden');
    };
  });

  document.querySelectorAll('[data-modal-publish]').forEach((button) => {
    button.onclick = async () => {
      const content = sanitize(document.getElementById('modalPostInput').value || '');
      if (!content && !state.modalImage) return showToast('Please type something before sharing.');
      const tagMatch = content.match(/#(\w+)/);
      await apiClient.post('/api/v1/posts', {
        content,
        image: state.modalImage,
        tag: tagMatch ? tagMatch[1] : 'Vibes'
      });
      document.getElementById('modalPostInput').value = '';
      state.modalImage = '';
      document.getElementById('modalComposePreview').classList.add('hidden');
      document.getElementById('composeModal').classList.add('hidden');
      await refreshPosts();
      updateFeedOnly();
      renderSidebarData(getCurrentUser());
      showToast('Pulse published!');
    };
  });

  document.querySelectorAll('[data-switch-user]').forEach((button) => {
    button.onclick = () => {
      persistActiveUser(button.dataset.switchUser);
      renderApp();
      showToast(`Switched to ${getCurrentUser().name}`);
    };
  });
}

function renderSidebarData(currentUser) {
  const trendingContainer = document.getElementById('trendingTopicsList');
  if (trendingContainer) {
    const counts = new Map();
    for (const post of state.posts) {
      if (!post.tag) continue;
      counts.set(post.tag, (counts.get(post.tag) || 0) + 1);
    }

    ['DesignSystems', 'CreativeCode', 'Minimalism', 'WebDev', 'MotionDesign'].forEach((tag) => {
      if (!counts.has(tag)) counts.set(tag, 1);
    });

    trendingContainer.innerHTML = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count], index) => `
        <div data-trending-tag="${tag}" class="cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between group">
          <div>
            <div class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Trending #${index + 1}</div>
            <div class="text-xs font-bold text-gray-200 group-hover:text-brand-400 transition-colors">#${tag}</div>
          </div>
          <span class="text-[10px] text-gray-400 font-mono">${count * 12 + 8} pulses</span>
        </div>
      `)
      .join('');

    trendingContainer.querySelectorAll('[data-trending-tag]').forEach((item) => {
      item.onclick = () => {
        state.activeTag = item.dataset.trendingTag;
        updateFeedOnly();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    });
  }

  const whoContainer = document.getElementById('whoToFollowList');
  if (whoContainer) {
    whoContainer.innerHTML = state.users
      .filter((user) => user.id !== currentUser.id)
      .map((user) => `
        <div class="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
          <div data-who-profile="${user.id}" class="flex items-center gap-2.5 min-w-0 cursor-pointer">
            <img src="${user.avatar}" class="w-8 h-8 rounded-xl object-cover flex-shrink-0" alt="${user.name}">
            <div class="min-w-0">
              <div class="text-xs font-bold text-white truncate hover:underline">${user.name}</div>
              <div class="text-[10px] text-gray-400 font-mono truncate">${user.handle}</div>
            </div>
          </div>
          <button data-follow-user="${user.id}" class="flex-shrink-0 text-xs px-3 py-1 rounded-xl font-bold transition-all ${(currentUser.following || []).includes(user.id) ? 'bg-white/10 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400' : 'bg-gradient-to-r from-brand-600 to-coral-500 text-white shadow-sm hover:opacity-90'}">
            ${(currentUser.following || []).includes(user.id) ? 'Following' : 'Follow'}
          </button>
        </div>
      `)
      .join('');

    whoContainer.querySelectorAll('[data-who-profile]').forEach((item) => {
      item.onclick = () => openProfileModal(item.dataset.whoProfile);
    });

    whoContainer.querySelectorAll('[data-follow-user]').forEach((btn) => {
      btn.onclick = async () => {
        await apiClient.post(`/api/v1/social/follow/${btn.dataset.followUser}`);
        const response = await apiClient.get('/api/v1/users');
        state.users = response.data;
        renderSidebarData(getCurrentUser());
        updateFeedOnly();
      };
    });
  }
}

function openProfileModal(userId) {
  const user = state.users.find((entry) => entry.id === userId);
  if (!user) return;

  const modal = document.getElementById('profileModal');
  modal.querySelector('.glass-box').innerHTML = `
    <div id="modalProfileBanner" class="h-28 w-full bg-gradient-to-r from-brand-600 via-coral-500 to-sky-500 relative" style="background-image:url(${user.banner}); background-size:cover;">
      <button data-close-profile class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-xs transition-colors"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="px-6 pb-6 pt-0 relative">
      <div class="flex justify-between items-end -mt-12 mb-3">
        <img src="${user.avatar}" class="w-24 h-24 rounded-2xl object-cover ring-4 ring-[#0b0f19] shadow-xl" alt="Profile">
      </div>
      <h2 class="text-xl font-extrabold text-white">${user.name}</h2>
      <div class="text-xs text-gray-400 font-mono mb-3">${user.handle}</div>
      <p class="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">${user.bio}</p>
      <div class="grid grid-cols-3 gap-2 py-3 px-4 rounded-2xl bg-white/5 border border-white/5 text-center mb-5">
        <div><div class="font-extrabold text-base text-white">${state.posts.filter((post) => post.authorId === user.id).length}</div><div class="text-[10px] text-gray-400 uppercase tracking-wider">Pulses</div></div>
        <div class="border-x border-white/10"><div class="font-extrabold text-base text-coral-400">${(user.followers || []).length}</div><div class="text-[10px] text-gray-400 uppercase tracking-wider">Followers</div></div>
        <div><div class="font-extrabold text-base text-sky-400">${(user.following || []).length}</div><div class="text-[10px] text-gray-400 uppercase tracking-wider">Following</div></div>
      </div>
      <div class="space-y-3">
        <div class="text-xs font-bold text-gray-300 uppercase tracking-wider">Latest Activity</div>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
          ${state.posts.filter((post) => post.authorId === user.id).slice(0, 5).map((post) => `<div class="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"><div class="text-gray-300 line-clamp-2">${post.content}</div><div class="text-[10px] text-gray-500 font-mono mt-1">${formatTime(post.timestamp)} &bull; ${post.likes.length} likes</div></div>`).join('') || '<div class="text-xs text-gray-500 py-3 text-center">No posts shared yet.</div>'}
        </div>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');

  modal.querySelector('[data-close-profile]').onclick = () => modal.classList.add('hidden');
}

subscribe(() => {
  // Reactive subscription placeholder
});

startBackgroundScene();
await loadBootstrap();
renderApp();
