export function renderComposer(currentUser) {
  return `
    <div class="glass-box rounded-3xl p-4 sm:p-5 mb-6 tilt-card shadow-card">
      <div class="tilt-inner space-y-3">
        <div class="flex items-start gap-3">
          <img id="composerCurrentAvatar" src="${currentUser.avatar}" class="w-10 h-10 rounded-2xl object-cover ring-2 ring-brand-500/30 flex-shrink-0" alt="Avatar">
          <div class="flex-1">
            <textarea id="mainPostInput" rows="2" placeholder="What is inspiring you today?" class="w-full bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none resize-none pt-1"></textarea>
          </div>
        </div>

        <div id="composerAttachmentPreview" class="hidden relative rounded-2xl overflow-hidden max-h-64 border border-white/10">
          <img id="composerAttachmentImg" src="" class="w-full h-full object-cover" alt="Upload Preview">
          <button data-remove-attached-image class="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-xs transition-colors">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-white/10">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <button data-photo-upload type="button" class="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-brand-400 text-xs font-medium transition-colors flex items-center gap-1.5">
              <i class="fa-regular fa-image text-brand-400"></i>
              <span class="hidden sm:inline">Photo</span>
            </button>
            <button data-vibe-upload type="button" class="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-coral-400 text-xs font-medium transition-colors flex items-center gap-1.5">
              <i class="fa-solid fa-palette text-coral-400"></i>
              <span class="hidden sm:inline">Vibe</span>
            </button>
            <button data-add-tag type="button" class="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-sky-400 text-xs font-medium transition-colors flex items-center gap-1.5">
              <i class="fa-solid fa-hashtag text-sky-400"></i>
              <span class="hidden sm:inline">Tag</span>
            </button>
          </div>

          <button data-publish-post class="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-coral-500 to-brand-500 hover:opacity-90 text-white text-xs font-bold shadow-glow-sm transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
            <span>Post</span>
            <i class="fa-solid fa-paper-plane text-[10px]"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}
