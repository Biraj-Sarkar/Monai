import { loginSucess, logout } from "./authSlice.js";

const API_URL = import.meta.env.VITE_API_URL;

const toAbsoluteUrl = (url) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${API_URL}${normalizedPath}`;
};

export const silentRefresh = async (dispatch) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Session expired");
    }

    const data = await response.json();
    const payload = data.data || data;

    dispatch(
      loginSucess({ userInfo: payload.user, userToken: payload.token })
    );

    return true;
  } catch (error) {
    console.error("Auto-login failed:", error.message);
    dispatch(logout());
    return false;
  }
};

export const authFetch = async (dispatch, url, options = {}) => {
  const requestUrl = toAbsoluteUrl(url);
  const currentToken = localStorage.getItem("token");
  const isFormDataBody = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
  };

  if (options.body && !isFormDataBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (currentToken) {
    headers.Authorization = `Bearer ${currentToken}`;
  }

  let response = await fetch(requestUrl, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await silentRefresh(dispatch);
  if (!refreshed) {
    return response;
  }

  const refreshedToken = localStorage.getItem("token");
  const retryHeaders = {
    ...headers,
    ...(refreshedToken ? { Authorization: `Bearer ${refreshedToken}` } : {}),
  };

  response = await fetch(requestUrl, {
    ...options,
    headers: retryHeaders,
    credentials: "include",
  });

  return response;
};

// Global dispatch support for non-React callers
let __globalDispatch = null;
export const setGlobalDispatch = (d) => {
  __globalDispatch = d;
};

export const authFetchGlobal = async (url, options = {}) => {
  if (!__globalDispatch) {
    throw new Error('Global dispatch not set. Call setGlobalDispatch(dispatch) from your app entry.');
  }
  return authFetch(__globalDispatch, url, options);
};
