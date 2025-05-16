import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

declare global {
  interface Window {
    electronAPI?: {
      getConfig?: () => Promise<{ API_URL?: string }>;
    };
  }
}

// Konfiguracja podstawowego URL dla backendu (fallback, jeśli IPC zawiedzie)
export const API_URL = "http://localhost:8080";

/**
 * Tworzenie instancji axios z podstawowymi ustawieniami.
 */
let axiosInstance: AxiosInstance | null = null;

async function createAxiosInstance(): Promise<AxiosInstance> {
  if (axiosInstance) return axiosInstance;

  let apiUrl = API_URL;

  if (window?.electronAPI?.getConfig) {
    try {
      const config = await window.electronAPI.getConfig();
      if (config?.API_URL) apiUrl = config.API_URL;

      console.log("Pobrano URL API z config.json:", apiUrl);
    } catch (e) {
      console.warn("Nie udało się pobrać config.json przez IPC, używam domyślnego URL:", e);
    }
  }

  axiosInstance = axios.create({
    baseURL: apiUrl + "/api",
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
