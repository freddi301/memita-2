import { Settings } from "@memita-2/ui";

export const basicSettings: Settings = {
  language: "it",
  theme: "dark",
  animations: "enabled",
  connectivity: {
    hyperswarm: { enabled: false },
    bridge: { server: { enabled: false }, clients: [] },
    lan: { enabled: false },
  },
};
