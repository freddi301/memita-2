import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { createApi, createHyperSwarm, createBridgeSwarm } from "@memita-2/core";
import { Sql } from "@memita-2/core";
import Database from "better-sqlite3";

(async () => {
  await app.whenReady();
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "provide database location",
    buttonLabel: "open database here",
    defaultPath: process.cwd(),
    properties: ["openDirectory", "createDirectory", "promptToCreate"],
  });
  if (canceled || !filePaths[0]) {
    app.quit();
    return;
  }
  const title = `Memita 2 ${filePaths[0]}`;
  const sql = createSql(path.join(filePaths[0], "db.db"));
  const api = await createApi(sql, {
    hyper: createHyperSwarm,
    bridge: createBridgeSwarm(8001, "127.0.0.1"),
  });
  for (const [methodName, method] of Object.entries(api)) {
    ipcMain.handle(methodName, (event, ...args) => (method as any)(...args));
  }
  const window = createWindow(title);
  if (!app.isPackaged) {
    window.webContents.openDevTools();
  }
  if (!app.isPackaged) installExtensions();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(title);
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
})();

function createSql(path: string): Sql {
  const db = new Database(path);
  return (strings, ...values) => ({
    async run() {
      db.prepare(strings.join("?")).run(values);
    },
    async all() {
      return db.prepare(strings.join("?")).all(values);
    },
  });
}

function createWindow(title: string) {
  const window = new BrowserWindow({
    width: app.isPackaged ? 300 : 800,
    height: 600,
    autoHideMenuBar: true,
    title,
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
