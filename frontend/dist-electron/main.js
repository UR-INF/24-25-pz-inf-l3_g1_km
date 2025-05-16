import { app, BrowserWindow, ipcMain, shell } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
const configTemplatePath = path.join(process.env.APP_ROOT, "electron", "config.default.json");
const userConfigPath = path.join(app.getPath("userData"), "config.json");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "hotel.ico"),
    width: 1200,
    height: 700,
    minWidth: 550,
    minHeight: 400,
    frame: false,
    titleBarStyle: "hidden",
    // macOS
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  ipcMain.on("window:minimize", () => win == null ? void 0 : win.minimize());
  ipcMain.on("focus-window", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });
  ipcMain.on("window:maximize", () => {
    if (win == null ? void 0 : win.isMaximized()) {
      win == null ? void 0 : win.unmaximize();
    } else {
      win == null ? void 0 : win.maximize();
    }
  });
  ipcMain.on("window:close", () => win == null ? void 0 : win.close());
  ipcMain.on("window:devtools", () => {
    win == null ? void 0 : win.webContents.openDevTools({ mode: "detach" });
  });
  ipcMain.on("open-external", (_, url) => {
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
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
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
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
