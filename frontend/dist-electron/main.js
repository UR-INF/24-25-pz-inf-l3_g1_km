import { app, BrowserWindow, ipcMain, shell } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
app.setAppUserModelId("Hotel Task Manager");
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "hotel.ico"),
    width: 1e3,
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
app.setName("Hotel Task Manager");
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
