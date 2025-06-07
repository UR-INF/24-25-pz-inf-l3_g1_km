import { app, shell, BrowserWindow, ipcMain } from "electron";
// import { createRequire } from 'node:module'
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";
import net from "node:net";
import fetch from "node-fetch";
import { dialog } from "electron";
import mysql from "mysql2/promise";

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

const configTemplatePath = path.join(process.env.APP_ROOT!, "electron", "config.default.json");
const userConfigPath = path.join(app.getPath("userData"), "config.json");

const defaultConfig = {
  API_HOST: "http://localhost",
  BACKEND_PORT: 8080,
  JAR_PATH: "",

  DB_HOST: "localhost",
  DB_NAME: "hoteltaskmanager",
  DB_USER: "root",
  DB_PASS: "",

  SEED_DB: false,
};

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "hotel.ico"),
    width: 1200,
    height: 700,
    minWidth: 550,
    minHeight: 400,

    frame: false,
    titleBarStyle: "hidden",

    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  ipcMain.on("window:minimize", () => win?.minimize());

  ipcMain.on("focus-window", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });

  ipcMain.on("window:maximize", () => {
    if (win?.isMaximized()) {
      win?.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.on("window:close", () => win?.close());

  ipcMain.on("window:devtools", () => {
    win?.webContents.openDevTools({ mode: "detach" });
  });

  ipcMain.on("open-external", (_, url: string) => {
    shell.openExternal(url);
  });

  ipcMain.handle("config:get", () => {
    try {
      const raw = fs.readFileSync(userConfigPath, "utf-8");
      return { ...defaultConfig, ...JSON.parse(raw) };
    } catch (e) {
      console.error("Nie udalo sie odczytac config.json:", e);
      return defaultConfig;
    }
  });

  ipcMain.handle("config:set", (_, newConfig) => {
    try {
      fs.writeFileSync(userConfigPath, JSON.stringify(newConfig, null, 2), "utf-8");
      return true;
    } catch (e) {
      console.error("Nie udalo sie zapisac config.json:", e);
      return false;
    }
  });

  ipcMain.handle("dialog:selectJarPath", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Java Archive", extensions: ["jar"] }],
    });

    if (result.canceled || result.filePaths.length === 0) return "";
    return result.filePaths[0];
  });

  ipcMain.handle("testDbConnection", async (_event, { host, name, user, pass }) => {
    try {
      const connection = await mysql.createConnection({
        host,
        user,
        password: pass,
        database: name,
      });

      await connection.ping();
      await connection.end();

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || String(error) };
    }
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let statusWindow: BrowserWindow | null = null;

export function showStatusWindow(message: string) {
  if (statusWindow && !statusWindow.isDestroyed()) {
    closeStatusWindow();
  }

  const isProd = !VITE_DEV_SERVER_URL;

  const cssPath = isProd
    ? path.join(process.resourcesPath, "resources", "tabler.min.css")
    : path.join(process.env.APP_ROOT!, "resources", "tabler.min.css");

  const cssContents = fs.readFileSync(cssPath, "utf-8");

  statusWindow = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "hotel.ico"),
    width: 500,
    height: 400,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    transparent: true,
    center: true,
    show: false,
    title: "Hotel Task Manager - Status ładowania aplikacji",
    webPreferences: {
      nodeIntegration: true,
    },
  });

  const html = `
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        ${cssContents}
        body {
          font-family: 'Inter', sans-serif;
        }
      </style>
    </head>
   <body class="d-flex align-items-center justify-content-center" style="height: 100vh; margin: 0; background: transparent;">
    <div class="card shadow-sm w-100" style="max-width: 400px;">
      <div class="card-header" style="-webkit-app-region: drag;">
        <h3 class="card-title">Hotel Task Manager</h3>
      </div>
      <div class="card-body text-center">
        <p class="text-secondary">${message.replace(/\n/g, "<br>")}</p>
      </div>
      <div class="card-footer border-top d-flex justify-content-center">
        <button class="btn btn-primary" onclick="window.close()">Zamknij</button>
      </div>
    </div>
  </body>

  </html>
  `;

  statusWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  statusWindow.once("ready-to-show", () => statusWindow?.show());
}

export function closeStatusWindow() {
  if (statusWindow && !statusWindow.isDestroyed()) {
    statusWindow.close();
    statusWindow = null;
  }
}

app.setAppUserModelId("Hotel Task Manager");
app.setName("Hotel Task Manager");

function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => resolve(true))
      .once("listening", () => {
        tester.close(() => resolve(false));
      })
      .listen(port);
  });
}

function waitForBackend(apiUrl: string, timeout = 15000): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();

    const interval = setInterval(() => {
      fetch(`${apiUrl}/actuator/health`)
        .then((res) => res.ok && res.json())
        .then((data: any) => {
          if (data && data.status === "UP") {
            clearInterval(interval);
            resolve(true);
          }
        })
        .catch(() => {
          if (Date.now() - start > timeout) {
            clearInterval(interval);
            resolve(false);
          }
        });
    }, 500);
  });
}

let backendProcess: ReturnType<typeof spawn> | null = null;

app.whenReady().then(async () => {
  if (!fs.existsSync(userConfigPath)) {
    try {
      fs.copyFileSync(configTemplatePath, userConfigPath);
      console.log("Skopiowano config.default.json do userData jako config.json");
    } catch (err) {
      console.error("Blad kopiowania config.json:", err);
    }
  }

  let config = defaultConfig;

  try {
    let raw = fs.readFileSync(userConfigPath, "utf-8").trim();

    if (raw === "") {
      throw new Error("Plik config.json jest pusty.");
    }

    const parsed = JSON.parse(raw);
    config = { ...defaultConfig, ...parsed };
  } catch (err) {
    console.warn("Wystapil problem z config.json, nadpisuje zawartosc domyslna:", err);

    try {
      fs.writeFileSync(userConfigPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
      console.log("Zapisano domyslna konfiguracje do config.json.");
    } catch (writeErr) {
      console.error("Nie udalo sie zapisac domyslnej konfiguracji:", writeErr);
    }
  }

  if (!config.BACKEND_PORT) {
    console.log("BACKEND_PORT nie zostal ustawiony w config.json — uzywam domyslnego: 8080");
  }

  if (!config.API_HOST) {
    console.log(
      "API_HOST nie zostal ustawiony w config.json — uzywam domyslnego: http://localhost",
    );
  }

  const port = config.BACKEND_PORT || 8080;
  const apiHost = config.API_HOST || "http://localhost";

  if (config.JAR_PATH && config.JAR_PATH.trim() !== "") {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      try {
        showStatusWindow("Rozpoczynam uruchamianie backendu...");

        const dbPassDecrypted = Buffer.from(config.DB_PASS, "base64").toString("utf-8");
        const args = [
          "-jar",
          config.JAR_PATH,
          `--spring.datasource.url=jdbc:mysql://${config.DB_HOST || "localhost"}:3306/${config.DB_NAME || "hoteltaskmanager"}?useSSL=false&serverTimezone=UTC`,
          `--spring.datasource.username=${config.DB_USER || "root"}`,
          `--spring.datasource.password=${dbPassDecrypted || ""}`,
          ...(config.SEED_DB === true
            ? ["--app.db.seed=true", "--spring.jpa.hibernate.ddl-auto=create"]
            : []),
        ];

        const out = fs.openSync(path.join(path.dirname(config.JAR_PATH), "backend-out.log"), "w");
        const err = fs.openSync(path.join(path.dirname(config.JAR_PATH), "backend-err.log"), "w");

        console.log("Uruchamianie backendu z argumentami:", args);

        backendProcess = spawn("java", args, {
          cwd: path.dirname(config.JAR_PATH),
          detached: true,
          stdio: ["ignore", out, err],
        });

        backendProcess.unref();
        console.log("Backend uruchomiony z:", config.JAR_PATH);

        showStatusWindow(`Backend został uruchomiony z: ${config.JAR_PATH}`);

        if (config.SEED_DB) {
          config.SEED_DB = false;

          try {
            const current = JSON.parse(fs.readFileSync(userConfigPath, "utf-8"));
            const updated = { ...current, SEED_DB: false };
            fs.writeFileSync(userConfigPath, JSON.stringify(updated, null, 2), "utf-8");
            console.log("SEED_DB ustawiono na false w config.json");
          } catch (err) {
            console.error("Nie udalo sie zaktualizowac SEED_DB:", err);
          }
        }
      } catch (e) {
        console.error("Nie udalo sie uruchomic backendu z config.json:", e);

        showStatusWindow(`Nie udało się uruchomić backendu:\n${String(e)}`);
      }
    } else {
      console.log(`Port ${port} juz jest zajety, nie uruchamiam backendu.`);

      showStatusWindow(`Port ${port} jest już zajęty. Nie uruchamiam backendu.`);
    }
  }

  showStatusWindow(
    "Oczekiwanie na backend. Aplikacja spróbuje nawiązać połączenie przez maksymalnie 20 sekund.",
  );

  const fullBackendUrl = `${apiHost}:${port}`;
  const backendReady = await waitForBackend(fullBackendUrl, 20000); // 20s timeout
  if (backendReady) {
    console.log("Backend gotowy - uruchamiam UI");
    closeStatusWindow();
  } else {
    console.warn("Backend nie odpowiedzial - UI moze nie dzialac!");

    let errorMessage =
      "Brak odpowiedzi od backendu - nie odpowiedział w ciągu 20 sekund.\n\n" +
      "Aplikacja może nie działać poprawnie. Spróbuj uruchomić ją ponownie lub sprawdź połączenie z backendem.";

    if (config.JAR_PATH && config.JAR_PATH.trim() !== "") {
      errorMessage +=
        "\n\nJeśli backend był uruchamiany lokalnie, sprawdź logi:\n" +
        "- backend-out.log\n" +
        "- backend-err.log\n" +
        `w katalogu: ${path.dirname(config.JAR_PATH)}`;
    }

    showStatusWindow(errorMessage);
  }

  createWindow();
});

app.on("before-quit", () => {
  if (backendProcess && !backendProcess.killed) {
    try {
      process.kill(backendProcess.pid);
      console.log("Zamknieto backend.");
    } catch (e) {
      console.error("Nie udalo sie zamknac backendu:", e);
    }
  }
});
