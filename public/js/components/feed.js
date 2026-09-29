import { renderPostCard } from './postCard.js';

export function renderFeedShell(state) {
  return `
    <div class="glass-box rounded-2xl p-1.5 flex items-center justify-between mb-5">
      <button data-tab="all" class="filter-tab-btn flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${state.currentTab === 'all' ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}">Explore</button>
      <button data-tab="following" class="filter-tab-btn flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${state.currentTab === 'following' ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}">Following</button>
      <button data-tab="trending" class="filter-tab-btn flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${state.currentTab === 'trending' ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}">Popular</button>
    </div>

    <div id="hashtagPillBanner" class="${state.activeTag ? '' : 'hidden'} glass-box rounded-2xl px-4 py-2.5 mb-5 flex items-center justify-between border border-brand-500/40 bg-brand-500/10">
      <div class="flex items-center gap-2 text-xs text-brand-300 font-semibold">
        <i class="fa-solid fa-hashtag"></i>
        <span>Filtered by <span id="activeHashtagLabel" class="text-white font-bold">${state.activeTag}</span></span>
      </div>
      <button data-clear-tag class="text-xs text-gray-400 hover:text-white transition-colors">Clear filter &times;</button>
    </div>

    <div id="feedStreamContainer" class="space-y-4">
      ${state.posts.length ? state.posts.map((post) => renderPostCard(post, state.users.find((user) => user.id === post.authorId), state.handlers)).join('') : ''}
    </div>

    <div id="emptyFeedMessage" class="${state.posts.length ? 'hidden' : ''} glass-box rounded-3xl p-10 text-center my-6">
      <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 text-xl">
        <i class="fa-regular fa-newspaper"></i>
      </div>
      <h4 class="font-bold text-white text-base mb-1">No pulses here yet</h4>
      <p class="text-xs text-gray-400 max-w-xs mx-auto">Follow more creators or share something new to start the stream!</p>
    </div>
  `;
}
