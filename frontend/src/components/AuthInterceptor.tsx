import { useEffect } from "react";
import { useAuth } from "../contexts/auth";
import { setupAuthInterceptor } from "../services/setupAxiosAuth";
import { createAxiosInstance } from "../services/api";
import { useNavigate } from "react-router";

export const AuthInterceptor = (): null => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const instance = await createAxiosInstance();
      setupAuthInterceptor(instance, {
        onUnauthorized: async () => {
          logout();
          navigate("/login", { replace: true });
        },
      });
    })();
  }, [state.user]);

  return null;
};
