export const BackendSecurityLayer = {
  csrfToken: null,
  lastPostTimestamp: 0,
  postCooldownMs: 2500,

  init() {
    const randBytes = new Uint8Array(16);
    window.crypto.getRandomValues(randBytes);
    this.csrfToken = Array.from(randBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  },

  sanitizeText(input) {
    if (!input) return '';
    const element = document.createElement('div');
    element.textContent = input.trim();
    return element.innerHTML;
  },

  validateAndAuthorizePost(content, imageAttachment) {
    const now = Date.now();
    if (now - this.lastPostTimestamp < this.postCooldownMs) {
      return {
        authorized: false,
        friendlyMessage: 'You are sharing pulses too quickly. Please pause for a moment.'
      };
    }

    if (!content && !imageAttachment) {
      return {
        authorized: false,
        friendlyMessage: 'Please type something before sharing.'
      };
    }

    if (content && content.length > 500) {
      return {
        authorized: false,
        friendlyMessage: 'Pulses are limited to 500 characters.'
      };
    }

    this.lastPostTimestamp = now;
    return {
      authorized: true,
      sanitizedContent: this.sanitizeText(content),
      csrfToken: this.csrfToken
    };
  },

  validateComment(content) {
    if (!content || !content.trim()) return null;
    if (content.length > 280) content = content.substring(0, 280);
    return this.sanitizeText(content);
  }
};
