import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", (method: string, ...args: any) =>
  ipcRenderer.invoke(method, ...args)
);
