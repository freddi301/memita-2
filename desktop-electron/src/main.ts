import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { api } from "./api";

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  window.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  for (const [methodName, method] of Object.entries(api)) {
    ipcMain.handle(methodName, (event, ...args) => (method as any)(...args));
  }
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
