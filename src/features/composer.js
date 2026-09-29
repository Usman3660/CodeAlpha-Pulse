import { BackendSecurityLayer } from '../utils/security.js';
import { getCurrentUser, saveState, store } from '../state/store.js';
import { renderApp } from '../render/app.js';
import { showToast } from '../utils/ui.js';

const composerImages = {
  photo: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80'
  ],
  vibe: [
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80'
  ]
};

export function promptPhotoUpload() {
  store.composerAttachedImage = composerImages.photo[Math.floor(Math.random() * composerImages.photo.length)];
  document.getElementById('composerAttachmentImg').src = store.composerAttachedImage;
  document.getElementById('composerAttachmentPreview').classList.remove('hidden');
}

export function attachGradientBanner() {
  store.composerAttachedImage = composerImages.vibe[Math.floor(Math.random() * composerImages.vibe.length)];
  document.getElementById('composerAttachmentImg').src = store.composerAttachedImage;
  document.getElementById('composerAttachmentPreview').classList.remove('hidden');
}

export function removeAttachedImage() {
  store.composerAttachedImage = '';
  document.getElementById('composerAttachmentPreview').classList.add('hidden');
  document.getElementById('composerAttachmentImg').src = '';
}

export function addTopicTagPrompt() {
  const input = document.getElementById('mainPostInput');
  input.value += ' #Pulse';
  input.focus();
}

export function handlePublishPost() {
  const input = document.getElementById('mainPostInput');
  const auth = BackendSecurityLayer.validateAndAuthorizePost(input.value, store.composerAttachedImage);

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
    image: store.composerAttachedImage || '',
    tag: extractedTag || 'Vibes',
    timestamp: Date.now(),
    likes: [],
    comments: []
  });

  saveState();
  input.value = '';
  removeAttachedImage();
  renderApp();
  showToast('Pulse published!');
}
