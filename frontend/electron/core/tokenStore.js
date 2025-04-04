import Store from "electron-store";
import jwt from "jsonwebtoken";

// Tworzymy instancję storage – dane będą zapisywane w pliku JSON w katalogu użytkownika
const store = new Store();

/**
 * Zapisuje token JWT do lokalnego storage (electron-store).
 * @param {string} token - Token autoryzacyjny JWT
 */
function setToken(token) {
	store.set("authToken", token);
}

/**
 * Odczytuje token JWT zapisany wcześniej w electron-store.
 * @returns {string|undefined} - Zwraca token lub undefined, jeśli nie istnieje
 */
function getToken() {
	return store.get("authToken");
}

/**
 * Usuwa token JWT z lokalnego storage.
 */
function clearToken() {
	store.delete("authToken");
}

/**
 * Zwraca email użytkownika z tokena JWT.
 * @returns {string|null} - Zwraca email użytkownika (string) jeśli token jest ważny,
 *                          lub null, jeśli token nie istnieje lub jest nieprawidłowy.
 */
function getEmailFromToken() {
	const token = getToken();
	if (!token) return null;

	try {
		const decoded = jwt.decode(token);
		return decoded?.sub || null; // sub = email użytkownika
	} catch (err) {
		return null;
	}
}

/**
 * Sprawdza, czy token jest ważny
 * @returns {boolean} - Zwraca true, jeśli token jest ważny, w przeciwnym razie false
 */
function isTokenValid() {
	const token = getToken();
	if (!token) return false;

	try {
		const decoded = jwt.decode(token);
		const now = Date.now() / 1000;

		if (decoded?.exp) {
			const expDate = new Date(decoded.exp * 1000).toLocaleString();
			console.log(`Token wygasa o: ${expDate}`);
			console.log(
				`Aktualny czas: ${new Date(now * 1000).toLocaleString()}`
			);
		}

		return decoded?.exp && now < decoded.exp;
	} catch (err) {
		console.error("Błąd przy dekodowaniu tokena:", err);
		return false;
	}
}

// Eksportujemy funkcje do użycia w innych plikach (np. apiClient, ipcHandlers)
export { setToken, getToken, clearToken, getEmailFromToken, isTokenValid };
