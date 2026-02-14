// API base URL can be overridden via VITE_API_BASE_URL; default uses backend in dev.
const DEV_DEFAULT_API = "http://localhost:5000";

const normalizeBaseUrl = (raw) => {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "";

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  try {
    const parsed = new URL(withoutTrailingSlash);

    // Guard against accidental host values like `assuredrewards.in.`
    if (parsed.hostname.endsWith(".")) {
      parsed.hostname = parsed.hostname.replace(/\.+$/, "");
    }

    const normalizedPath = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.replace(/\/+$/, "") : "";
    return `${parsed.origin}${normalizedPath}`;
  } catch {
    return withoutTrailingSlash;
  }
};

const ENV_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || "");
const BASE_URL = ENV_BASE_URL || (import.meta.env.DEV ? DEV_DEFAULT_API : "");

export const getApiBaseUrl = () => BASE_URL;

export const buildApiUrl = (path, baseOverride = BASE_URL) => {
  if (!path.startsWith("/")) {
    throw new Error("API path must start with /");
  }
  return `${baseOverride}${path}`;
};

export const resolvePublicAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  return buildApiUrl(path.startsWith("/") ? path : `/${path}`);
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

export const apiRequest = async (path, { method = "GET", body, token, headers } = {}) => {
  const requestHeaders = {
    ...(headers || {}),
  };

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const primaryUrl = buildApiUrl(path);
  const response = await fetch(primaryUrl, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    const baseMessage = data?.message || data?.error || `Request failed (${response.status})`;
    const detail =
      data?.error && data.error !== baseMessage ? `: ${data.error}` : "";
    const message = `${baseMessage}${detail}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
