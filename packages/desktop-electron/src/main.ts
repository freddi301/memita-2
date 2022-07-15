import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { createApi } from "@memita-2/core";
import { Sql } from "@memita-2/core";
import Database from "better-sqlite3";
import sqlite3 from "sqlite3";

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
  const api = await createApi(sql);
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

function createSql(path: string) {
  if (process.platform === "win32") return createSqlSqlite3(path);
  return createSqlBetterSqlite3(path);
}

function createSqlSqlite3(path: string): Sql {
  const db = sqlite3.cached.Database(path);
  sqlite3.verbose();
  const sql = (strings: TemplateStringsArray, ...values: any[]) => {
    const doIt = () =>
      new Promise<any>((resolve, reject) => {
        db.all(strings.join("?"), values, (error, rows) => {
          if (error) {
            reject(error);
          } else {
            resolve(rows as any);
          }
        });
      });
    return {
      run: doIt,
      all: doIt,
      text() {
        return strings.join("");
      },
    };
  };
  sql.close = () => {
    return new Promise<void>((resolve, reject) =>
      db.close((error) => (error ? reject(error) : resolve(undefined)))
    );
  };
  return sql;
}

function createSqlBetterSqlite3(path: string): Sql {
  const db = new Database(path);
  const sql = (strings: TemplateStringsArray, ...values: any[]) => ({
    text() {
      return strings.join("");
    },
    async run() {
      db.prepare(strings.join("?")).run(values);
    },
    async all() {
      return db.prepare(strings.join("?")).all(values);
    },
  });
  sql.close = async () => {
    db.close();
  };
  return sql;
}
