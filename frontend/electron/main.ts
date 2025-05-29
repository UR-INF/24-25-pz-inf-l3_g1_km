import { app, shell, BrowserWindow, ipcMain } from "electron";
// import { createRequire } from 'node:module'
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";
import net from "node:net";
import fetch from "node-fetch";
import { dialog } from "electron";

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
  JAR_PATH: "",
  BACKEND_PORT: 8080,
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
const logDir = app.getPath("userData");
const out = fs.openSync(path.join(logDir, "backend-out.log"), "a");
const err = fs.openSync(path.join(logDir, "backend-err.log"), "a");

app.whenReady().then(async () => {
  if (!fs.existsSync(userConfigPath)) {
    try {
      fs.copyFileSync(configTemplatePath, userConfigPath);
      console.log("Skopiowano config.default.json do userData jako config.json");
    } catch (err) {
      console.error("Blad kopiowania config.json:", err);
    }
  }

  const raw = fs.readFileSync(userConfigPath, "utf-8");
  const config = JSON.parse(raw);
  const port = config.BACKEND_PORT || 8080;
  const apiHost = config.API_HOST || "http://localhost";

  if (config.JAR_PATH && config.JAR_PATH.trim() !== "") {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      try {
        backendProcess = spawn("java", ["-jar", config.JAR_PATH], {
          detached: true,
          stdio: ["ignore", out, err],
        });
        backendProcess.unref();
        console.log("Backend uruchomiony z:", config.JAR_PATH);
      } catch (e) {
        console.error("Nie udalo sie uruchomic backendu z config.json:", e);
      }
    } else {
      console.log(`Port ${port} juz jest zajety, nie uruchamiam backendu.`);
    }
  }

  console.log("Czekam na backend...");

  const fullBackendUrl = `${apiHost}:${port}`;
  const backendReady = await waitForBackend(fullBackendUrl, 20000); // 20s timeout
  if (backendReady) {
    console.log("Backend gotowy - uruchamiam UI");
  } else {
    console.warn("Backend nie odpowiedzial - UI moze nie dzialac!");
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
