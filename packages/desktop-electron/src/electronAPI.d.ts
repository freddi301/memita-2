import type { API } from "@memita-2/ui";

declare global {
  interface Window {
    electronAPI: API;
  }
}
