import { API } from "./api";

declare global {
  interface Window {
    electronAPI: API;
  }
}
