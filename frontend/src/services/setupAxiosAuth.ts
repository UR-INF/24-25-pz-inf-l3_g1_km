import { AxiosError, AxiosResponse } from "axios";
import { createAxiosInstance } from "./api";

let isInterceptorRegistered = false;

/**
 * Opcje przekazywane do interceptora autoryzacyjnego.
 *
 * @property {() => void} onUnauthorized - Funkcja wywoływana przy błędzie 401 (unauthorized).
 */
type Options = {
  onUnauthorized: () => void;
};

/**
 * Konfiguruje interceptor odpowiedzi HTTP, który obsługuje błędy autoryzacji (401).
 *
 * @param {Options} param0 - Obiekt opcji zawierający funkcję obsługi błędu 401.
 * @returns {Promise<void>} - Obietnica zakończenia konfiguracji interceptora.
 */
export const setupAuthInterceptor = async ({ onUnauthorized }: Options): Promise<void> => {
  if (isInterceptorRegistered) return;

  const api = await createAxiosInstance();

  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        console.warn("401 - użytkownik niezautoryzowany");
        onUnauthorized();
      }
      return Promise.reject(error);
    },
  );

  isInterceptorRegistered = true;
};
