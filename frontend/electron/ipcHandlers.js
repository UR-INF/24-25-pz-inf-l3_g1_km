import { ipcMain } from "electron";
import api from "./core/apiClient.js";
import {
	setToken,
	clearToken,
	getEmailFromToken,
	isTokenValid,
} from "./core/tokenStore.js";

// Obsługa żądania GET z renderera – przekazywane do apiClient
ipcMain.handle("api:get", async (_, endpoint, config) => {
	return await api.get(endpoint, config);
});

// Obsługa żądania POST z renderera
ipcMain.handle("api:post", async (_, endpoint, data, config) => {
	return await api.post(endpoint, data, config);
});

// Obsługa żądania PUT z renderera
ipcMain.handle("api:put", async (_, endpoint, data, config) => {
	return await api.put(endpoint, data, config);
});

// Obsługa żądania DELETE z renderera
ipcMain.handle("api:delete", async (_, endpoint, config) => {
	return await api.delete(endpoint, config);
});

// Ustawienie tokena z renderera – zapisuje go w electron-store
ipcMain.on("api:setToken", (_, token) => {
	setToken(token);
});

// Usunięcie tokena – np. przy wylogowaniu
ipcMain.on("api:clearToken", () => {
	clearToken();
});

// Obsługuje zapytanie o email użytkownika z tokena JWT
ipcMain.handle("api:getEmail", () => {
	return getEmailFromToken();
});

// Obsługuje zapytanie o status logowania – sprawdza, czy token jest ważny
ipcMain.handle("api:isLoggedIn", () => {
	return isTokenValid();
});

// Obsługuje zapytanie o dane zalogowanego użytkownika
ipcMain.handle("api:getCurrentUser", async () => {
    return await api.getCurrentUser();
});
