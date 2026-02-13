import { useEffect, useState } from "react";

export const AUTH_TOKEN_KEY = "cashback_auth_token";
export const AUTH_CHANGE_EVENT = "cashback-auth-change";
export const REDIRECT_AFTER_LOGIN_KEY = "cashback_redirect_after_login";

export const dispatchAuthChange = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const storeAuthToken = (token) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
  dispatchAuthChange();
};

export const clearAuthToken = () => {
  storeAuthToken(null);
};

export const storePostLoginRedirect = (path) => {
  if (typeof window === "undefined") return;
  if (path) {
    localStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, path);
  } else {
    localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
  }
};

export const popPostLoginRedirect = () => {
  if (typeof window === "undefined") return "";
  const target = localStorage.getItem(REDIRECT_AFTER_LOGIN_KEY) || "";
  localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
  return target;
};

export const useAuth = () => {
  const [authToken, setAuthToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(AUTH_TOKEN_KEY) || "";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncAuthToken = () => {
      setAuthToken(localStorage.getItem(AUTH_TOKEN_KEY) || "");
    };

    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthToken);
    window.addEventListener("storage", syncAuthToken);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthToken);
      window.removeEventListener("storage", syncAuthToken);
    };
  }, []);

  return {
    authToken,
    isAuthenticated: Boolean(authToken),
  };
};
