const axios = require("axios");
const tokenStore = require("./tokenStore");

// Bazowy URL API backendu
const API_BASE_URL = "http://localhost:8080/api";

// Tworzymy instancję klienta Axios z domyślną konfiguracją
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Interceptor: dodaje token do każdego żądania (oprócz /auth)
api.interceptors.request.use(
	(config) => {
		const isAuthRoute = config.url.includes("/auth");
		const token = tokenStore.getToken();

		// Jeśli endpoint nie dotyczy /auth i token istnieje – dodaj nagłówek
		if (!isAuthRoute && token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		if (error.response?.status === 401 || error.response?.status === 403) {
			tokenStore.clearToken(); // wyloguj użytkownika
			// TODO: info do renderer, żeby przekierować
		}

		return Promise.reject(error);
	}
);

/**
 * Wysyła żądanie GET do backendu.
 * @param {string} endpoint - Ścieżka endpointu, np. '/users'
 * @param {object} config - Opcjonalna konfiguracja Axios
 * @returns {Promise<any>} - Odpowiedź z backendu
 */
async function get(endpoint, config = {}) {
	const res = await api.get(endpoint, config);
	return res.data;
}

/**
 * Wysyła żądanie POST do backendu.
 * @param {string} endpoint - Ścieżka endpointu, np. '/auth/login'
 * @param {object} data - Dane do przesłania (body requesta)
 * @param {object} config - Opcjonalna konfiguracja Axios
 * @returns {Promise<any>} - Odpowiedź z backendu
 */
async function post(endpoint, data = {}, config = {}) {
	const res = await api.post(endpoint, data, config);
	return res.data;
}

/**
 * Wysyła żądanie PUT do backendu.
 * @param {string} endpoint - Ścieżka endpointu
 * @param {object} data - Dane do przesłania
 * @param {object} config - Opcjonalna konfiguracja
 * @returns {Promise<any>} - Odpowiedź z backendu
 */
async function put(endpoint, data = {}, config = {}) {
	const res = await api.put(endpoint, data, config);
	return res.data;
}

/**
 * Wysyła żądanie DELETE do backendu.
 * @param {string} endpoint - Ścieżka endpointu
 * @param {object} config - Opcjonalna konfiguracja
 * @returns {Promise<any>} - Odpowiedź z backendu
 */
async function del(endpoint, config = {}) {
	const res = await api.delete(endpoint, config);
	return res.data;
}

// Eksport publicznych metod klienta API
module.exports = {
	get,
	post,
	put,
	delete: del,
};
