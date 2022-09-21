import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { createApi } from "@memita-2/core";
import { SqlDatabase } from "@memita-2/core";
import Database from "better-sqlite3";
import sqlite3 from "sqlite3";
import { createTables } from "@memita-2/core/dist/tables";

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
  const sqlDatabase = createSqlDatabase(path.join(filePaths[0], "db.db"));
  const tables = await createTables(sqlDatabase);
  const filesPath = path.join(filePaths[0], "files");
  const api = await createApi({ filesPath, tables });
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
  process.on("SIGINT", function () {
    api.stop().then(
      () => {
        process.exit(0);
      },
      (error) => {
        console.error(error);
        process.exit(1);
      }
    );
  });
})();

function createWindow(title: string) {
  const window = new BrowserWindow({
    width: app.isPackaged ? 300 : 800,
    height: 600,
    autoHideMenuBar: true,
    title,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webSecurity: process.env.NODE_ENV !== "development",
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

function createSqlDatabase(path: string) {
  if (process.platform === "win32") return createSqlDatabaseSqlite3(path);
  return createSqlDatabaseBetterSqlite3(path);
}

function createSqlDatabaseSqlite3(path: string): SqlDatabase {
  const db = sqlite3.cached.Database(path);
  sqlite3.verbose();
  return {
    run(query, values) {
      return new Promise((resolve, reject) =>
        db.run(query, values, (error) => (error ? reject(error) : resolve()))
      );
    },
    all(query, values) {
      return new Promise((resolve, reject) =>
        db.all(query, values, (error, rows) =>
          error ? reject(error) : resolve(rows)
        )
      );
    },
    close() {
      return new Promise<void>((resolve, reject) =>
        db.close((error) => (error ? reject(error) : resolve(undefined)))
      );
    },
  };
}

function createSqlDatabaseBetterSqlite3(path: string): SqlDatabase {
  const db = new Database(path);
  return {
    async run(query, values) {
      db.prepare(query).run(values);
    },
    async all(query, values) {
      return db.prepare(query).all(values);
    },
    async close() {
      db.close();
    },
  };
}

ipcMain.handle("pickFiles", async (event, ...args) => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
  });
  return filePaths;
});
