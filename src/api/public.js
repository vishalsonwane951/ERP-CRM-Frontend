import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const http = axios.create({ baseURL: `${BASE}/public`, timeout: 20000 });
http.interceptors.response.use((r) => r.data.data, (err) => {
  const e = new Error(err.response?.data?.error?.message || 'We could not reach the server. Check your connection and try again.');
  e.status = err.response?.status;
  throw e;
});

/** Calls a candidate can make with only the link's token (no sign-in) */
export const publicApi = {
  show: (token) => http.get(`/onboarding/${token}`),
  uploadUrl: (token, b) => http.post(`/onboarding/${token}/upload-url`, b),
  confirm: (token, b) => http.post(`/onboarding/${token}/confirm`, b),
  submit: (token, b) => http.post(`/onboarding/${token}/submit`, b),
};
