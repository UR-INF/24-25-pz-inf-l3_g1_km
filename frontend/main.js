const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true, // Pozwala na użycie `require` w rendererze
            contextIsolation: false, // Wymagane, aby `require` działał
        }
    });

    mainWindow.loadFile('source/auth/login.html');

    app.on('activate', () => {
        // Na macOS aplikacje działają w tle po zamknięciu wszystkich okien.
        // Ten kod sprawdza, czy nie ma żadnych otwartych okien i tworzy nowe,
        // gdy użytkownik kliknie ikonę aplikacji w Docku.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Na macOS aplikacje zwykle działają w tle po zamknięciu wszystkich okien,
    // więc nie wywołujemy app.quit(), aby użytkownik mógł ponownie otworzyć aplikację z Docka.
    if (process.platform !== 'darwin') {
        app.quit(); // Zamykamy aplikację tylko na Windows i Linux
    }
});
