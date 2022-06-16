const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", (method: string, ...args: any) =>
  ipcRenderer.invoke(method, ...args)
);
