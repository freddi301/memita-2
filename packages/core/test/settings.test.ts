import { createApi } from "../src";
import { createSql } from "./sqlite/sql";

test("settings", async () => {
  const api = createApi(createSql());
  expect(await api.getSettings()).toEqual(undefined);
  const settingsA = { theme: "light", animations: "disabled" } as const;
  await api.setSettings(settingsA);
  expect(await api.getSettings()).toEqual(settingsA);
  const settingsB = { theme: "dark", animations: "enabled" } as const;
  await api.setSettings(settingsA);
  expect(await api.getSettings()).toEqual(settingsA);
});
