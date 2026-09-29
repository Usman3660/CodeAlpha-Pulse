function authHeaders() {
  const userId = localStorage.getItem('pulse_active_user_id') || 'u1';
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId
  };
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      ...authHeaders(),
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = payload?.message || 'Request failed.';
    throw new Error(message);
  }

  return payload;
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body || {}) }),
  del: (path) => request(path, { method: 'DELETE' })
};
