import { AxiosInstance, AxiosError, AxiosResponse } from "axios";

/**
 * Opcje przekazywane do interceptora autoryzacyjnego.
 *
 * @property {() => void} onUnauthorized - Funkcja wywoływana przy błędzie 401 (unauthorized).
 */
type Options = {
  onUnauthorized: () => void;
};

export const setupAuthInterceptor = (api: AxiosInstance, { onUnauthorized }: Options) => {
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
};
