export function renderProfileSwitcher(currentUser, users) {
  return `
    <button data-toggle-switcher class="w-full p-2 xl:p-2.5 rounded-2xl glass-box hover:bg-white/10 transition-all flex items-center justify-between gap-2.5 group">
      <div class="flex items-center gap-2.5 min-w-0">
        <img id="sidebarUserAvatar" src="${currentUser.avatar}" class="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/50 flex-shrink-0" alt="Avatar">
        <div class="hidden xl:block text-left min-w-0">
          <div id="sidebarUserName" class="text-xs font-bold text-white truncate">${currentUser.name}</div>
          <div id="sidebarUserHandle" class="text-[11px] text-gray-400 truncate font-mono">${currentUser.handle}</div>
        </div>
      </div>
      <i class="hidden xl:block fa-solid fa-ellipsis text-gray-400 group-hover:text-white text-xs"></i>
    </button>

    <div id="userSwitcherMenu" class="hidden absolute bottom-full left-0 mb-3 w-64 bg-[#121826] bg-opacity-95 backdrop-blur-2xl rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-[100] border border-white/20 ring-1 ring-white/10">
      <div class="px-2.5 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Switch Profile</div>
      <div id="userListOptions" class="space-y-1 mt-1">
        ${users.map((user) => `
          <button data-switch-user="${user.id}" class="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/10 transition-colors ${user.id === currentUser.id ? 'bg-brand-500/20 border border-brand-500/30' : ''}">
            <div class="flex items-center gap-2.5 min-w-0">
              <img src="${user.avatar}" class="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="${user.name}">
              <div class="truncate">
                <div class="text-xs font-bold text-white truncate">${user.name}</div>
                <div class="text-[10px] text-gray-400 font-mono truncate">${user.handle}</div>
              </div>
            </div>
            ${user.id === currentUser.id ? '<i class="fa-solid fa-circle-check text-xs text-brand-400"></i>' : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}
