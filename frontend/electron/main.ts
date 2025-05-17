import { app, shell, BrowserWindow, ipcMain } from "electron";
// import { createRequire } from 'node:module'
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

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
      return JSON.parse(raw);
    } catch (e) {
      console.error("Nie udało się odczytać config.json:", e);
      return { API_URL: "http://localhost:8080" };
    }
  });

  ipcMain.handle("config:set", (_, newConfig) => {
    try {
      fs.writeFileSync(userConfigPath, JSON.stringify(newConfig, null, 2), "utf-8");
      return true;
    } catch (e) {
      console.error("Nie udało się zapisać config.json:", e);
      return false;
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

app.setAppUserModelId("Hotel Task Manager");
app.setName("Hotel Task Manager");

app.whenReady().then(() => {
  createWindow();

  if (!fs.existsSync(userConfigPath)) {
    try {
      fs.copyFileSync(configTemplatePath, userConfigPath);
      console.log("Skopiowano config.default.json do userData jako config.json");
    } catch (err) {
      console.error("Błąd kopiowania config.json:", err);
    }
  }
});
