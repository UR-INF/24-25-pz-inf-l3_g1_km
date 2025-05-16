import { AxiosError, AxiosInstance, AxiosResponse } from "axios";

type Options = {
  onUnauthorized: () => void;
};

let isInterceptorRegistered = false;

export const setupAuthInterceptor = async (
  api: AxiosInstance,
  { onUnauthorized }: Options,
): Promise<void> => {
  if (isInterceptorRegistered) return;

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
