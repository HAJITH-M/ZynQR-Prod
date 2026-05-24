import axios from "axios";
import { getApiErrorMessage, toast } from "../utils/toast.js";

export const AUTH_TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export function setAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth-token-change"));
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new Event("auth-token-change"));
}

/** For `useSyncExternalStore`: react when token changes (this tab or another). */
export function subscribeAuthToken(listener) {
  const onStorage = (e) => {
    if (e.key === AUTH_TOKEN_KEY || e.key === null) listener();
  };
  const onSameTab = () => listener();

  window.addEventListener("storage", onStorage);
  window.addEventListener("auth-token-change", onSameTab);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("auth-token-change", onSameTab);
  };
}

// ---------------------
// AXIOS INSTANCE
// ---------------------
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // refresh token cookie support
  timeout: 10000,
});

// ---------------------
// REQUEST INTERCEPTOR
// ---------------------
axiosInstance.interceptors.request.use(
  (config) => {
    // Refresh uses the httpOnly cookie; a stale Bearer here can confuse some backends.
    if (config.url?.includes("/auth/refresh")) {
      delete config.headers.Authorization;
      return config;
    }

    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------
// REFRESH TOKEN LOGIC
// ---------------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

function parseAccessTokenFromRefreshResponse(data) {
  if (!data || typeof data !== "object") return null;
  return data.access_token ?? null;
}

async function refreshAccessToken() {
  const res = await axiosInstance.post("/auth/refresh");
  return parseAccessTokenFromRefreshResponse(res.data);
}

/**
 * When NOT to run “401 → refresh → retry” for this request.
 *
 * Logged-in routes like `/auth/change-password` still get `Authorization: Bearer …`
 * from the request interceptor above — nothing here removes the token.
 *
 * We only skip refresh because those endpoints often return 401 for wrong
 * password / OTP (not an expired access token), which would otherwise loop:
 * refresh 200 → retry → 401 again.
 */
function shouldNotRefreshOn401(config) {
  const path = config?.url ?? "";
  return (
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/change-password") ||
    path.includes("/auth/forgot-password")
  );
}

// ---------------------
// RESPONSE INTERCEPTOR
// ---------------------
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    // if refresh endpoint itself fails, logout
    if (originalRequest?.url?.includes("/auth/refresh")) {
      clearAuthToken();
      return Promise.reject(error);
    }

    // Only handle 401 (session expiry), not wrong-password / wrong-OTP style 401s
    if (status === 401 && !originalRequest._retry && !shouldNotRefreshOn401(originalRequest)) {
      originalRequest._retry = true;

      // If refresh already in progress, wait in queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (!newToken) {
          clearAuthToken();
          return Promise.reject(error);
        }

        // Save new access token
        setAuthToken(newToken);
        // Process queued requests
        processQueue(null, newToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearAuthToken();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 429) {
      toast.error(getApiErrorMessage(error));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;