import { contextBridge, ipcRenderer, clipboard } from "electron";

contextBridge.exposeInMainWorld("api", (method: string, ...args: any) =>
  ipcRenderer.invoke(method, ...args)
);

contextBridge.exposeInMainWorld("copyToClipboard", (text: string) =>
  clipboard.writeText(text)
);

contextBridge.exposeInMainWorld("pickFiles", () =>
  ipcRenderer.invoke("pickFiles")
);
