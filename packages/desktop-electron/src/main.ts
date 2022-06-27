import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { createApi, createSync, createHyperSwarm } from "@memita-2/core";
import { createSql } from "./sql";

const sql = createSql();
const api = createApi(sql);
const swarm = createHyperSwarm();

(async () => {
  while (true) {
    const sync = await createSync({ sql, api, swarm });
    (async () => {
      while (true) {
        const synced = await sync();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    })();
  }
})();

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

function installExtensions() {
  const {
    default: installExtension,
    REACT_DEVELOPER_TOOLS,
  } = require("electron-devtools-installer");

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name: string) => {
      console.log(`Added Extension:  ${name}`);
    })
    .catch((err: unknown) => {
      console.log("An error occurred: ", err);
    });
}

app.whenReady().then(() => {
  for (const [methodName, method] of Object.entries(api)) {
    ipcMain.handle(methodName, (event, ...args) => (method as any)(...args));
  }
  const window = createWindow();
  if (!app.isPackaged) {
    window.webContents.openDevTools();
  }
  if (!app.isPackaged) installExtensions();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
