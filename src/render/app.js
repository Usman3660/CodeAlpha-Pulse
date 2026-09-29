import { getCurrentUser, getUser, store } from '../state/store.js';
import { getRelativeTime } from '../utils/time.js';

export function renderApp() {
  renderNavAndHeader();
  renderFeed();
  renderTrendingTopics();
  renderWhoToFollow();
  renderUserSwitcherList();
  window.attachTiltPhysics?.();
}

export function renderNavAndHeader() {
  const user = getCurrentUser();

  document.getElementById('sidebarUserAvatar').src = user.avatar;
  document.getElementById('sidebarUserName').innerText = user.name;
  document.getElementById('sidebarUserHandle').innerText = user.handle;
  document.getElementById('composerCurrentAvatar').src = user.avatar;

  const mobileAvatar = document.getElementById('mobileCurrentAvatar');
  if (mobileAvatar) mobileAvatar.src = user.avatar;
}

export function renderUserSwitcherList() {
  const listEl = document.getElementById('userListOptions');
  listEl.innerHTML = store.users.map((user) => `
    <button 
      onclick="switchActiveUser('${user.id}')"
      class="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/10 transition-colors ${user.id === store.currentUserId ? 'bg-brand-500/20 border border-brand-500/30' : ''}">
      <div class="flex items-center gap-2.5 min-w-0">
        <img src="${user.avatar}" class="w-8 h-8 rounded-lg object-cover flex-shrink-0">
        <div class="truncate">
          <div class="text-xs font-bold text-white truncate">${user.name}</div>
          <div class="text-[10px] text-gray-400 font-mono truncate">${user.handle}</div>
        </div>
      </div>
      ${user.id === store.currentUserId ? '<i class="fa-solid fa-circle-check text-xs text-brand-400"></i>' : ''}
    </button>
  `).join('');
}

export function renderFeed() {
  const container = document.getElementById('feedStreamContainer');
  const emptyNotice = document.getElementById('emptyFeedMessage');
  const pillBanner = document.getElementById('hashtagPillBanner');
  const hashtagLabel = document.getElementById('activeHashtagLabel');
  const currentUser = getCurrentUser();

  if (store.activeTagFilter) {
    pillBanner.classList.remove('hidden');
    hashtagLabel.innerText = '#' + store.activeTagFilter;
  } else {
    pillBanner.classList.add('hidden');
  }

  let filtered = [...store.posts];

  if (store.currentFeedTab === 'following') {
    const following = currentUser.following || [];
    filtered = filtered.filter((post) => following.includes(post.authorId) || post.authorId === currentUser.id);
  } else if (store.currentFeedTab === 'trending') {
    filtered.sort((a, b) => (b.likes.length + (b.comments?.length || 0)) - (a.likes.length + (a.comments?.length || 0)));
  } else {
    filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  if (store.activeTagFilter) {
    filtered = filtered.filter((post) => post.tag && post.tag.toLowerCase() === store.activeTagFilter.toLowerCase());
  }

  if (store.searchQuery.trim()) {
    const query = store.searchQuery.toLowerCase();
    filtered = filtered.filter((post) => {
      const author = getUser(post.authorId);
      return post.content.toLowerCase().includes(query) ||
        (post.tag && post.tag.toLowerCase().includes(query)) ||
        author.name.toLowerCase().includes(query) ||
        author.handle.toLowerCase().includes(query);
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyNotice.classList.remove('hidden');
    return;
  }

  emptyNotice.classList.add('hidden');

  container.innerHTML = filtered.map((post) => {
    const author = getUser(post.authorId);
    const isLiked = post.likes.includes(currentUser.id);
    const isOwner = post.authorId === currentUser.id;
    const formattedTime = getRelativeTime(post.timestamp);

    const commentsHtml = (post.comments || []).map((comment) => {
      const commentAuthor = getUser(comment.authorId);
      return `
        <div class="flex items-start gap-2.5 pt-2.5 border-t border-white/5 text-xs">
          <img src="${commentAuthor.avatar}" class="w-6 h-6 rounded-full object-cover mt-0.5 cursor-pointer" onclick="openProfileModal('${commentAuthor.id}')" alt="Avatar">
          <div class="flex-1 bg-white/5 rounded-2xl p-2.5 px-3">
            <div class="flex items-center justify-between mb-0.5">
              <span class="font-bold text-white cursor-pointer hover:underline" onclick="openProfileModal('${commentAuthor.id}')">${commentAuthor.name}</span>
              <span class="text-[10px] text-gray-500 font-mono">${getRelativeTime(comment.timestamp)}</span>
            </div>
            <div class="text-gray-300 leading-relaxed">${comment.content}</div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <article class="glass-box rounded-3xl p-4 sm:p-5 tilt-card shadow-card relative overflow-hidden group" id="card-${post.id}">
        <div class="tilt-inner space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img 
                src="${author.avatar}" 
                class="w-10 h-10 rounded-2xl object-cover ring-2 ring-brand-500/20 cursor-pointer hover:ring-brand-500 transition-all flex-shrink-0"
                onclick="openProfileModal('${author.id}')"
                alt="${author.name}">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-white cursor-pointer hover:underline" onclick="openProfileModal('${author.id}')">
                    ${author.name}
                  </span>
                  ${post.tag ? `<span onclick="filterByHashtag('${post.tag}')" class="cursor-pointer text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold hover:bg-brand-500/30 transition-colors">#${post.tag}</span>` : ''}
                </div>
                <div class="text-xs text-gray-400 font-mono flex items-center gap-1.5">
                  <span>${author.handle}</span>
                  <span>&bull;</span>
                  <span>${formattedTime}</span>
                </div>
              </div>
            </div>
            <div>
              ${isOwner ? `<button onclick="deletePost('${post.id}')" title="Delete Post" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center text-xs transition-colors"><i class="fa-regular fa-trash-can"></i></button>` : `<button onclick="openProfileModal('${author.id}')" class="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"><i class="fa-solid fa-ellipsis"></i></button>`}
            </div>
          </div>
          <div class="text-sm text-gray-200 leading-relaxed whitespace-pre-line font-body">
            ${post.content}
          </div>
          ${post.image ? `<div class="rounded-2xl overflow-hidden max-h-96 border border-white/10 bg-black/40"><img src="${post.image}" class="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-300" alt="Attachment" onerror="this.style.display='none'"></div>` : ''}
          <div class="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
            <button onclick="toggleLike('${post.id}', event)" class="like-btn flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${isLiked ? 'text-coral-400 bg-coral-500/10 font-bold' : 'text-gray-400 hover:text-coral-400 hover:bg-white/5'}">
              <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-sm transition-transform active:scale-125"></i>
              <span>${post.likes.length}</span>
            </button>
            <button onclick="toggleCommentSection('${post.id}')" class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-gray-400 hover:text-sky-400 hover:bg-white/5 transition-colors">
              <i class="fa-regular fa-comment text-sm"></i>
              <span>${(post.comments || []).length}</span>
            </button>
            <button onclick="handleSharePost('${post.id}')" class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-gray-400 hover:text-mint-400 hover:bg-white/5 transition-colors">
              <i class="fa-regular fa-paper-plane text-sm"></i>
              <span>Share</span>
            </button>
          </div>
          <div id="comment-drawer-${post.id}" class="hidden pt-3 border-t border-white/5 space-y-3">
            <div class="flex items-center gap-2">
              <img src="${currentUser.avatar}" class="w-7 h-7 rounded-xl object-cover flex-shrink-0" alt="Avatar">
              <input 
                type="text" 
                id="comment-field-${post.id}"
                placeholder="Write a comment..." 
                onkeydown="if(event.key === 'Enter') submitComment('${post.id}')"
                class="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors">
              <button onclick="submitComment('${post.id}')" class="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors">
                Reply
              </button>
            </div>
            <div class="space-y-2">${commentsHtml}</div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

export function renderTrendingTopics() {
  const container = document.getElementById('trendingTopicsList');
  const tagCount = {};

  store.posts.forEach((post) => {
    if (post.tag) {
      tagCount[post.tag] = (tagCount[post.tag] || 0) + 1;
    }
  });

  ['DesignSystems', 'CreativeCode', 'Minimalism', 'WebDev', 'MotionDesign'].forEach((tag) => {
    if (!tagCount[tag]) tagCount[tag] = 1;
  });

  const sorted = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]).slice(0, 5);
  container.innerHTML = sorted.map((tag, index) => `
    <div onclick="filterByHashtag('${tag}')" class="cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between group">
      <div>
        <div class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Trending #${index + 1}</div>
        <div class="text-xs font-bold text-gray-200 group-hover:text-brand-400 transition-colors">#${tag}</div>
      </div>
      <span class="text-[10px] text-gray-400 font-mono">${tagCount[tag] * 12 + 8} pulses</span>
    </div>
  `).join('');
}

export function renderWhoToFollow() {
  const container = document.getElementById('whoToFollowList');
  const currentUser = getCurrentUser();
  const candidates = store.users.filter((user) => user.id !== currentUser.id);

  container.innerHTML = candidates.map((user) => {
    const isFollowing = (currentUser.following || []).includes(user.id);
    return `
      <div class="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
        <div class="flex items-center gap-2.5 min-w-0 cursor-pointer" onclick="openProfileModal('${user.id}')">
          <img src="${user.avatar}" class="w-8 h-8 rounded-xl object-cover flex-shrink-0" alt="${user.name}">
          <div class="min-w-0">
            <div class="text-xs font-bold text-white truncate hover:underline">${user.name}</div>
            <div class="text-[10px] text-gray-400 font-mono truncate">${user.handle}</div>
          </div>
        </div>
        <button 
          onclick="toggleFollowUser('${user.id}')"
          class="flex-shrink-0 text-xs px-3 py-1 rounded-xl font-bold transition-all ${isFollowing ? 'bg-white/10 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400' : 'bg-gradient-to-r from-brand-600 to-coral-500 text-white shadow-sm hover:opacity-90'}">
          ${isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    `;
  }).join('');
}
