import { useEffect } from "react";
import { useAuth } from "../contexts/auth";
import { setupAuthInterceptor } from "../services/setupAxiosAuth";
import { axiosInstance } from "../services/api";

/**
 * Komponent techniczny odpowiedzialny za konfigurację interceptorów HTTP.
 *
 * Rejestruje `response interceptor` na instancji axios,
 * który:
 * - reaguje na błędy HTTP (np. 401 Unauthorized)
 * - wykonuje `logout()` z kontekstu autoryzacji
 *
 * Komponent powinien być zamontowany raz, na poziomie głównym aplikacji
 * (np. obok `<AuthProvider>`).
 *
 * Nie renderuje żadnego widoku – działa tylko jako efekt uboczny (`useEffect`).
 *
 * @returns {null} Komponent nie renderuje żadnego JSX.
 */
export const AuthInterceptor = (): null => {
	const { state, logout } = useAuth();

	useEffect(() => {
		setupAuthInterceptor(axiosInstance, {
			onUnauthorized: async () => {
				logout();
				// nawigacja do strony logowania?
			},
		});
	}, [state.user]);

	return null;
};
