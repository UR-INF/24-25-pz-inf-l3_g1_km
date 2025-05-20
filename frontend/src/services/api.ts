import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

declare global {
  interface Window {
    electronAPI?: {
      selectJarPath(): Promise<string>;
      getConfig?: () => Promise<{
        API_HOST?: string;
        BACKEND_PORT?: number;
        JAR_PATH?: string;
      }>;
      setConfig?: (data: {
        API_HOST?: string;
        BACKEND_PORT?: number;
        JAR_PATH?: string;
      }) => Promise<boolean>;
    };
  }
}

// Konfiguracja podstawowego URL dla backendu (fallback, jeśli IPC zawiedzie)
export const API_HOST = "http://localhost";
export const API_PORT = 8080;
export const API_URL = `${API_HOST}:${API_PORT}`;

/**
 * Tworzenie instancji axios z podstawowymi ustawieniami.
 */
let axiosInstance: AxiosInstance | null = null;

async function createAxiosInstance(): Promise<AxiosInstance> {
  if (axiosInstance) return axiosInstance;

  let apiHost = API_HOST;
  let port = API_PORT;

  if (window?.electronAPI?.getConfig) {
    try {
      const config = await window.electronAPI.getConfig();
      if (config?.API_HOST) apiHost = config.API_HOST;
      if (config?.BACKEND_PORT) port = config.BACKEND_PORT;

      console.log("Pobrano konfigurację API z config.json:", apiHost, port);
    } catch (e) {
      console.warn("Nie udało się pobrać config.json przez IPC, używam domyślnego URL:", e);
    }
  }

  const fullApiUrl = `${apiHost}:${port}`;

  axiosInstance = axios.create({
    baseURL: fullApiUrl + "/api",
  });

  /**
   * Interceptor do dodawania tokena autoryzacyjnego do każdego żądania,
   * z wyjątkiem endpointów zawierających '/auth/'.
   */
  axiosInstance.interceptors.request.use((config) => {
    const isPublicRoute = config.url?.includes("/auth/");
    if (!isPublicRoute) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        } as any;
      }
    }

    return config;
  });

  return axiosInstance;
}

/**
 * Funkcja do resetowania instancji axios.
 */
export function resetAxiosInstance() {
  axiosInstance = null;
}

/**
 * API klient z podstawowymi metodami HTTP.
 */
export const api = {
  /**
   * Wysyła żądanie GET.
   *
   * @param url - Ścieżka endpointu (np. "/invoices")
   * @param params - Parametry zapytania (opcjonalne, przekazywane jako query string)
   * @param config - Dodatkowa konfiguracja Axios (opcjonalna, np. responseType, headers)
   * @returns Promise z odpowiedzią Axios
   */
  get: async (url: string, params?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
    const instance = await createAxiosInstance();
    return instance.get(url, { ...config, params });
  },

  /**
   * Wysyła żądanie POST.
   *
   * @param url - Ścieżka endpointu (np. "/reservations")
   * @param data - Dane do przesłania (body requestu)
   * @param config - Dodatkowa konfiguracja Axios (opcjonalna, np. headers)
   * @returns Promise z odpowiedzią Axios
   */
  post: async (url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
    const instance = await createAxiosInstance();
    return instance.post(url, data, config);
  },

  /**
   * Wysyła żądanie PUT.
   *
   * @param url - Ścieżka endpointu (np. "/invoices/123")
   * @param data - Dane do aktualizacji (body requestu)
   * @param config - Dodatkowa konfiguracja Axios (opcjonalna, np. headers)
   * @returns Promise z odpowiedzią Axios
   */
  put: async (url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
    const instance = await createAxiosInstance();
    return instance.put(url, data, config);
  },

  /**
   * Wysyła żądanie DELETE.
   *
   * @param url - Ścieżka endpointu (np. "/invoices/123")
   * @param config - Dodatkowa konfiguracja Axios (opcjonalna, np. headers)
   * @returns Promise z odpowiedzią Axios
   */
  delete: async (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
    const instance = await createAxiosInstance();
    return instance.delete(url, config);
  },
};

export { createAxiosInstance, axiosInstance };
