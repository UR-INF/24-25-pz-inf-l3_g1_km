const { contextBridge, ipcRenderer } = require("electron");

// Udostępniamy wybrane funkcje z głównego procesu do okna renderer (frontend)
// Wszystko jest widoczne pod window.api
contextBridge.exposeInMainWorld("electronAPI", {
	// Wysyła zapytanie GET przez IPC do głównego procesu
	get: (endpoint, config) => ipcRenderer.invoke("api:get", endpoint, config),

	// Wysyła zapytanie POST przez IPC
	post: (endpoint, data, config) =>
		ipcRenderer.invoke("api:post", endpoint, data, config),

	// Wysyła zapytanie PUT przez IPC do głównego procesu
	put: (endpoint, data, config) =>
		ipcRenderer.invoke("api:put", endpoint, data, config),

	// Wysyła zapytanie DELETE przez IPC do głównego procesu
	delete: (endpoint, config) =>
		ipcRenderer.invoke("api:delete", endpoint, config),

	// Przekazuje token JWT z renderera do głównego procesu (zapis do electron-store)
	setToken: (token) => ipcRenderer.send("api:setToken", token),

	// Usuwa token z głównego procesu (czyszczenie w electron-store)
	clearToken: () => ipcRenderer.send("api:clearToken"),

	// Udostępnia metodę do rendereru, aby pobrać email użytkownika z tokena JWT
	getCurrentUserEmail: () => ipcRenderer.invoke("api:getEmail"),

	// Wysyła zapytanie do main procesu, aby sprawdzić, czy token jest ważny (czy użytkownik jest zalogowany)
	isLoggedIn: () => ipcRenderer.invoke("api:isLoggedIn"),

	// Pobiera dane zalogowanego użytkownika
	getCurrentUser: () => ipcRenderer.invoke("api:getCurrentUser"),
});
