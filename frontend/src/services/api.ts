import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// Konfiguracja podstawowego URL dla backendu
const API_URL = "http://localhost:8080/api";

/**
 * Tworzenie instancji axios z podstawowymi ustawieniami.
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
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
  get: (url: string, params?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> =>
    axiosInstance.get(url, { ...config, params }),

  /**
   * Wysyła żądanie POST.
   * 
   * @param url - Ścieżka endpointu (np. "/reservations")
   * @param data - Dane do przesłania (body requestu)
   * @param config - Dodatkowa konfiguracja Axios (opcjonalna, np. headers)
   * @returns Promise z odpowiedzią Axios
   */
  post: (url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> =>
    axiosInstance.post(url, data, config),

  /**
   * Wysyła żądanie PUT.
   * 
   * @param url - Ścieżka endpointu (np. "/invoices/123")
   * @param data - Dane do aktualizacji (body requestu)
   * @param config - Dodatkowa konfiguracja Axios (opcjonalna, np. headers)
   * @returns Promise z odpowiedzią Axios
   */
  put: (url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> =>
    axiosInstance.put(url, data, config),

  /**
   * Wysyła żądanie DELETE.
   * 
   * @param url - Ścieżka endpointu (np. "/invoices/123")
   * @param config - Dodatkowa konfiguracja Axios (opcjonalna, np. headers)
   * @returns Promise z odpowiedzią Axios
   */
  delete: (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> =>
    axiosInstance.delete(url, config),
};


export { axiosInstance };
