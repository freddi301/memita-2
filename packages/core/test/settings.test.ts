import { createApi } from "../src/api";
import { createSql } from "./sql";
import { createTestSwarm } from "../src/components/swarm/testSwarm";

test("settings", async () => {
  const api = createApi(createSql(), createTestSwarm());
  expect(await api.getSettings()).toEqual(undefined);
  const settingsA = { theme: "light", animations: "disabled" } as const;
  await api.setSettings(settingsA);
  expect(await api.getSettings()).toEqual(settingsA);
  const settingsB = { theme: "dark", animations: "enabled" } as const;
  await api.setSettings(settingsA);
  expect(await api.getSettings()).toEqual(settingsA);
});
