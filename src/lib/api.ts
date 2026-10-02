import axios from 'axios';

// NEXT_PUBLIC_API_URL must point at the Express backend, e.g.
//   http://localhost:5000/api          (local)
//   https://your-backend.onrender.com/api  (production, set in Vercel)
//
// Next.js inlines NEXT_PUBLIC_* at build time, so changing it on the host
// requires a redeploy, not just a restart.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// This app has no Next.js API routes, so the '/api' fallback resolves to the
// frontend's own origin and every request silently returns the HTML 404 page.
// Make that loud rather than leaving it to look like a dead backend.
if (!process.env.NEXT_PUBLIC_API_URL && typeof window !== 'undefined') {
  console.error(
    '[ATS] NEXT_PUBLIC_API_URL is not set. API requests will fail. ' +
      'Set it to your backend URL (ending in /api) and redeploy.'
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('ats_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) delete config.headers['Content-Type'];
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ats_token');
      localStorage.removeItem('ats_user');
      const p = window.location.pathname;
      if (!p.includes('/login') && !p.includes('/register'))
        window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
