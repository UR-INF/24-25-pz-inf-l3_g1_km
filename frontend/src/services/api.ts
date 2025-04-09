import axios, { AxiosResponse } from "axios";

// Konfiguracja podstawowego URL dla backendu
const API_URL = "http://localhost:8080/api";

/**
 * Tworzenie instancji axios z podstawowymi ustawieniami.
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
   * @param url - Ścieżka endpointu
   * @param params - Parametry zapytania (opcjonalne)
   * @returns Promise z odpowiedzią Axios
   */
  get: (url: string, params?: any): Promise<AxiosResponse> => axiosInstance.get(url, { params }),

  /**
   * Wysyła żądanie POST.
   * @param url - Ścieżka endpointu
   * @param data - Dane do przesłania
   * @returns Promise z odpowiedzią Axios
   */
  post: (url: string, data?: any): Promise<AxiosResponse> => axiosInstance.post(url, data),

  /**
   * Wysyła żądanie PUT.
   * @param url - Ścieżka endpointu
   * @param data - Dane do aktualizacji
   * @returns Promise z odpowiedzią Axios
   */
  put: (url: string, data?: any): Promise<AxiosResponse> => axiosInstance.put(url, data),

  /**
   * Wysyła żądanie DELETE.
   * @param url - Ścieżka endpointu
   * @returns Promise z odpowiedzią Axios
   */
  delete: (url: string): Promise<AxiosResponse> => axiosInstance.delete(url),
};

export { axiosInstance };
