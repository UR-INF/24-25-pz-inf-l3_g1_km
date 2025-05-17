import { app as t, BrowserWindow as l, ipcMain as n, shell as h } from "electron";
import { fileURLToPath as u } from "node:url";
import o from "node:path";
import s from "node:fs";
const d = o.dirname(u(import.meta.url));
process.env.APP_ROOT = o.join(d, "..");
const c = process.env.VITE_DEV_SERVER_URL, w = o.join(process.env.APP_ROOT, "dist-electron"), f = o.join(process.env.APP_ROOT, "dist"), g = o.join(process.env.APP_ROOT, "electron", "config.default.json"), r = o.join(t.getPath("userData"), "config.json");
process.env.VITE_PUBLIC = c ? o.join(process.env.APP_ROOT, "public") : f;
let e;
function p() {
  e = new l({
    icon: o.join(process.env.VITE_PUBLIC, "hotel.ico"),
    width: 1200,
    height: 700,
    minWidth: 550,
    minHeight: 400,
    frame: !1,
    titleBarStyle: "hidden",
    webPreferences: {
      webSecurity: !1,
      preload: o.join(d, "preload.mjs")
    }
  }), n.on("window:minimize", () => e == null ? void 0 : e.minimize()), n.on("focus-window", () => {
    e && (e.isMinimized() && e.restore(), e.show(), e.focus());
  }), n.on("window:maximize", () => {
    e != null && e.isMaximized() ? e == null || e.unmaximize() : e == null || e.maximize();
  }), n.on("window:close", () => e == null ? void 0 : e.close()), n.on("window:devtools", () => {
    e == null || e.webContents.openDevTools({ mode: "detach" });
  }), n.on("open-external", (i, a) => {
    h.openExternal(a);
  }), n.handle("config:get", () => {
    try {
      const i = s.readFileSync(r, "utf-8");
      return JSON.parse(i);
    } catch (i) {
      return console.error("Nie udało się odczytać config.json:", i), { API_URL: "http://localhost:8080" };
    }
  }), n.handle("config:set", (i, a) => {
    try {
      return s.writeFileSync(r, JSON.stringify(a, null, 2), "utf-8"), !0;
    } catch (m) {
      return console.error("Nie udało się zapisać config.json:", m), !1;
    }
  }), c ? e.loadURL(c) : e.loadFile(o.join(f, "index.html"));
}
t.on("window-all-closed", () => {
  process.platform !== "darwin" && (t.quit(), e = null);
});
t.on("activate", () => {
  l.getAllWindows().length === 0 && p();
});
t.setAppUserModelId("Hotel Task Manager");
t.setName("Hotel Task Manager");
t.whenReady().then(() => {
  if (p(), !s.existsSync(r))
    try {
      s.copyFileSync(g, r), console.log("Skopiowano config.default.json do userData jako config.json");
    } catch (i) {
      console.error("Błąd kopiowania config.json:", i);
    }
});
export {
  w as MAIN_DIST,
  f as RENDERER_DIST,
  c as VITE_DEV_SERVER_URL
};
