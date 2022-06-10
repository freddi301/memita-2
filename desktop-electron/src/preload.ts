const { contextBridge, ipcRenderer } = require("electron");
import { api } from "./api";

contextBridge.exposeInMainWorld(
  "electronAPI",
  Object.fromEntries(
    Object.entries(api).map(([methodName]) => [
      methodName,
      (...args: any) => ipcRenderer.invoke(methodName, ...args),
    ])
  )
);
