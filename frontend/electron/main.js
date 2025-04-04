const { app, BrowserWindow } = require("electron");
const path = require("path");
const tokenStore = require("./core/tokenStore");

// Importujemy IPC, żeby zarejestrować obsługę zdarzeń
require("./ipcHandlers");

let mainWindow;

app.whenReady().then(async () => {
	const isLoggedIn = await tokenStore.isTokenValid(); // Sprawdzamy, czy token jest ważny

	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: false, // Wyłączony dostęp do Node.js w rendererze (dla bezpieczeństwa)
			contextIsolation: true, // Umożliwia bezpieczne użycie preload.js
		},
	});

	// Wybieramy, który plik HTML załadować na podstawie statusu logowania
	mainWindow.loadFile(
		isLoggedIn ? "source/home/home.html" : "source/auth/login.html"
	);

	app.on("activate", () => {
		// Na macOS aplikacje działają w tle po zamknięciu wszystkich okien.
		// Ten kod sprawdza, czy nie ma żadnych otwartych okien i tworzy nowe,
		// gdy użytkownik kliknie ikonę aplikacji w Docku.
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	// Na macOS aplikacje zwykle działają w tle po zamknięciu wszystkich okien,
	// więc nie wywołujemy app.quit(), aby użytkownik mógł ponownie otworzyć aplikację z Docka.
	if (process.platform !== "darwin") {
		app.quit(); // Zamykamy aplikację tylko na Windows i Linux
	}
});
