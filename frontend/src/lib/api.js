const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

export async function apiRequest(path, options = {}) {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('contactos_token') : null;
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers, cache: 'no-store' });
  if (response.status === 401 && typeof window !== 'undefined' && token) {
    window.localStorage.removeItem('contactos_token');
    window.localStorage.removeItem('contactos_usuario');
    window.dispatchEvent(new Event('contactos:unauthorized'));
  }

  if (!response.ok) {
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    throw new Error(data?.error || `No se pudo completar la solicitud (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function apiUrl() {
  return API_URL;
}
