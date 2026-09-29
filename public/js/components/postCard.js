import { getCurrentUser, state } from '../state/store.js';

export function renderPostCard(post, author, handlers) {
  const currentUser = getCurrentUser();
  const isLiked = post.likes.includes(currentUser.id);
  const isOwner = post.authorId === currentUser.id;
  const formattedTime = handlers.formatTime(post.timestamp);

  const commentsHtml = (post.comments || []).map((comment) => {
    const commentAuthor = state.users.find((user) => user.id === comment.authorId) || currentUser;
    return `
      <div class="flex items-start gap-2.5 pt-2.5 border-t border-white/5 text-xs">
        <img src="${commentAuthor.avatar}" class="w-6 h-6 rounded-full object-cover mt-0.5 cursor-pointer" data-profile="${commentAuthor.id}" alt="Avatar">
        <div class="flex-1 bg-white/5 rounded-2xl p-2.5 px-3">
          <div class="flex items-center justify-between mb-0.5">
            <span class="font-bold text-white cursor-pointer hover:underline" data-profile="${commentAuthor.id}">${commentAuthor.name}</span>
            <span class="text-[10px] text-gray-500 font-mono">${handlers.formatTime(comment.timestamp)}</span>
          </div>
          <div class="text-gray-300 leading-relaxed">${comment.content}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <article class="glass-box rounded-3xl p-4 sm:p-5 tilt-card shadow-card relative overflow-hidden group" data-post-id="${post.id}">
      <div class="tilt-inner space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="${author.avatar}" class="w-10 h-10 rounded-2xl object-cover ring-2 ring-brand-500/20 cursor-pointer hover:ring-brand-500 transition-all flex-shrink-0" data-profile="${author.id}" alt="${author.name}">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-white cursor-pointer hover:underline" data-profile="${author.id}">${author.name}</span>
                ${post.tag ? `<span data-tag="${post.tag}" class="cursor-pointer text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold hover:bg-brand-500/30 transition-colors">#${post.tag}</span>` : ''}
              </div>
              <div class="text-xs text-gray-400 font-mono flex items-center gap-1.5">
                <span>${author.handle}</span>
                <span>&bull;</span>
                <span>${formattedTime}</span>
              </div>
            </div>
          </div>
          <div>
            ${isOwner ? `<button data-delete-post="${post.id}" title="Delete Post" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center text-xs transition-colors"><i class="fa-regular fa-trash-can"></i></button>` : `<button data-profile="${author.id}" class="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"><i class="fa-solid fa-ellipsis"></i></button>`}
          </div>
        </div>

        <div class="text-sm text-gray-200 leading-relaxed whitespace-pre-line font-body">${post.content}</div>

        ${post.image ? `<div class="rounded-2xl overflow-hidden max-h-96 border border-white/10 bg-black/40"><img src="${post.image}" class="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-300" alt="Attachment"></div>` : ''}

        <div class="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
          <button data-like-post="${post.id}" class="like-btn flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${isLiked ? 'text-coral-400 bg-coral-500/10 font-bold' : 'text-gray-400 hover:text-coral-400 hover:bg-white/5'}">
            <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-sm transition-transform active:scale-125"></i>
            <span>${post.likes.length}</span>
          </button>
          <button data-toggle-comments="${post.id}" class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-gray-400 hover:text-sky-400 hover:bg-white/5 transition-colors">
            <i class="fa-regular fa-comment text-sm"></i>
            <span>${(post.comments || []).length}</span>
          </button>
          <button data-share-post="${post.id}" class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-gray-400 hover:text-mint-400 hover:bg-white/5 transition-colors">
            <i class="fa-regular fa-paper-plane text-sm"></i>
            <span>Share</span>
          </button>
        </div>

        <div id="comment-drawer-${post.id}" class="hidden pt-3 border-t border-white/5 space-y-3">
          <div class="flex items-center gap-2">
            <img src="${currentUser.avatar}" class="w-7 h-7 rounded-xl object-cover flex-shrink-0" alt="Avatar">
            <input type="text" id="comment-field-${post.id}" placeholder="Write a comment..." class="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors">
            <button data-submit-comment="${post.id}" class="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors">Reply</button>
          </div>
          <div class="space-y-2">${commentsHtml}</div>
        </div>
      </div>
    </article>
  `;
}
