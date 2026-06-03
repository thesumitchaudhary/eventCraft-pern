const DEFAULT_DEV_BACKEND_API_URL = "http://localhost:4041/api";

const ensureApiSuffix = (url: string) => {
  const trimmed = url.trim().replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const isPlaceholderBackendUrl = (url?: string) => {
  if (!url) return true;
  return /your-backend\.onrender\.com/i.test(url);
};

const resolveBackendApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;

  if (configuredUrl && !isPlaceholderBackendUrl(configuredUrl)) {
    return ensureApiSuffix(configuredUrl);
  }
  return DEFAULT_DEV_BACKEND_API_URL;
};

const resolveServiceUrl = (
  serviceEnvVar: string | undefined,
  serviceSegment: string,
) => {
  if (!isPlaceholderBackendUrl(serviceEnvVar)) {
    return serviceEnvVar!.trim().replace(/\/$/, "");
  }

  return `${resolveBackendApiBaseUrl()}/${serviceSegment}`;
};

export const API_BASE_URL = resolveBackendApiBaseUrl();
export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

export const CUSTOMER_API_URL = resolveServiceUrl(
  import.meta.env.VITE_CUSTOMER_BACKEND_URL as string | undefined,
  "customer",
);
