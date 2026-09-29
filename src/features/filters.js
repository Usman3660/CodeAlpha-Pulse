import { getCurrentUser, store } from '../state/store.js';
import { renderFeed } from '../render/app.js';

export function setFeedFilter(tabKey) {
  store.currentFeedTab = tabKey;

  document.querySelectorAll('.filter-tab-btn').forEach((button) => {
    button.classList.remove('bg-gradient-to-r', 'from-brand-600', 'to-brand-500', 'text-white', 'shadow-sm');
    button.classList.add('text-gray-400');
  });

  const activeBtn = document.getElementById(`tab-${tabKey}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-gradient-to-r', 'from-brand-600', 'to-brand-500', 'text-white', 'shadow-sm');
    activeBtn.classList.remove('text-gray-400');
  }

  document.querySelectorAll('.nav-item').forEach((element) => element.classList.remove('active', 'bg-white/10', 'text-white'));
  if (tabKey === 'all') document.getElementById('nav-home')?.classList.add('active', 'bg-white/10', 'text-white');
  if (tabKey === 'trending') document.getElementById('nav-explore')?.classList.add('active', 'bg-white/10', 'text-white');
  if (tabKey === 'following') document.getElementById('nav-network')?.classList.add('active', 'bg-white/10', 'text-white');

  renderFeed();
  window.attachTiltPhysics?.();
}

export function filterByHashtag(tag) {
  store.activeTagFilter = tag;
  renderFeed();
  window.attachTiltPhysics?.();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function clearHashtagFilter() {
  store.activeTagFilter = '';
  renderFeed();
  window.attachTiltPhysics?.();
}

export function handleSearchQuery(value) {
  store.searchQuery = value;
  const clearBtn = document.getElementById('searchClearBtn');
  if (value.trim()) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }
  renderFeed();
  window.attachTiltPhysics?.();
}

export function clearSearchQuery() {
  const input = document.getElementById('globalSearchInput');
  input.value = '';
  handleSearchQuery('');
}

export function switchActiveUser(id) {
  store.currentUserId = id;
  window.toggleUserSwitcherModal?.();
  window.saveState?.();
  window.renderApp?.();
  window.showToast?.(`Switched to ${getCurrentUser().name}`);
}
