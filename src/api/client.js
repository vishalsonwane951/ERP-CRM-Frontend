import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const KEY = 'muster.tokens';

export const tokens = {
  get: () => JSON.parse(localStorage.getItem(KEY) || 'null'),
  set: (t) => localStorage.setItem(KEY, JSON.stringify(t)),
  clear: () => localStorage.removeItem(KEY),
};

export const http = axios.create({ baseURL: BASE, timeout: 20000 });

http.interceptors.request.use((cfg) => {
  const t = tokens.get();
  if (t) cfg.headers.Authorization = `Bearer ${t.accessToken}`;
  return cfg;
});

let refreshing = null;
http.interceptors.response.use(
  (r) => r.data.data, // API envelope: { data }
  async (err) => {
    const cfg = err.config; const t = tokens.get();
    if (err.response?.status === 401 && t?.refreshToken && cfg && !cfg._retry && !cfg.url.includes('/auth/')) {
      cfg._retry = true;
      refreshing ??= axios.post(`${BASE}/auth/refresh`, { refreshToken: t.refreshToken })
        .then((r) => tokens.set({ accessToken: r.data.data.accessToken, refreshToken: r.data.data.refreshToken }))
        .finally(() => { refreshing = null; });
      try { await refreshing; return http(cfg); } catch { tokens.clear(); window.dispatchEvent(new Event('muster:signout')); }
    }
    const e = new Error(err.response?.data?.error?.message || 'We could not reach the server. Check your connection and try again.');
    e.status = err.response?.status; e.code = err.response?.data?.error?.code;
    throw e;
  },
);
