export function showToast(message) {
  const toast = document.getElementById('simpleToast');
  document.getElementById('toastMessageText').innerText = message;

  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  clearTimeout(window.__pulseToastTimer);
  window.__pulseToastTimer = setTimeout(() => {
    toast.classList.add('translate-y-24', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 2600);
}

export function triggerHeartBurst(event) {
  const burst = document.createElement('div');
  burst.className = 'heart-burst-item text-coral-500 text-lg';
  burst.innerHTML = '<i class="fa-solid fa-heart"></i>';

  burst.style.left = `${event.clientX}px`;
  burst.style.top = `${event.clientY}px`;

  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 850);
}

export function toggleUserSwitcherModal() {
  document.getElementById('userSwitcherMenu')?.classList.toggle('hidden');
}

export function closeUserSwitcherOnOutsideClick(event) {
  const dropdown = document.getElementById('profileSwitcherDropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    document.getElementById('userSwitcherMenu')?.classList.add('hidden');
  }
}
