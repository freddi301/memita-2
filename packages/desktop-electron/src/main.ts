import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { createApi } from "@memita-2/core";
import { sql } from "./sql";

const api = createApi(sql);

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  if (process.env.NODE_ENV === "development") {
    window.loadURL("http://localhost:9000");
  } else {
    window.loadFile(path.join(__dirname, "index.html"));
  }
  return window;
}

app.whenReady().then(() => {
  for (const [methodName, method] of Object.entries(api)) {
    ipcMain.handle(methodName, (event, ...args) => (method as any)(...args));
  }
  const window = createWindow();
  if (!app.isPackaged) {
    window.webContents.openDevTools();
  }
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
