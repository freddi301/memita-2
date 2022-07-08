import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { createApi, createHyperSwarm, createBridgeSwarm } from "@memita-2/core";
import { Sql } from "@memita-2/core";
import Database from "better-sqlite3";

function createSql(): Sql {
  const db = new Database(":memory:");
  return (strings, ...values) => ({
    async run() {
      db.prepare(strings.join("?")).run(values);
    },
    async all() {
      return db.prepare(strings.join("?")).all(values);
    },
  });
}

const sql = createSql();
const api = createApi(sql, {
  hyper: createHyperSwarm,
  bridge: createBridgeSwarm(8001, "127.0.0.1"),
});

api.then((api) => {
  for (const [methodName, method] of Object.entries(api)) {
    ipcMain.handle(methodName, (event, ...args) => (method as any)(...args));
  }
});

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

false &&
  api.then((api) => {
    api.addAccount({
      author: "fred",
      nickname: "Fred",
      settings: { theme: "dark", animations: "enabled" },
    });
    api.addAccount({
      author: "ali",
      nickname: "Alice",
      settings: { theme: "light", animations: "disabled" },
    });
    api.addContact({
      account: "fred",
      author: "ali",
      nickname: "Alice",
      label: "",
      version_timestamp: Date.now(),
    });
    api.addContact({
      account: "ali",
      author: "fred",
      nickname: "Fred",
      label: "",
      version_timestamp: Date.now(),
    });
  });
