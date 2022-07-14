import { Account } from "@memita-2/ui";
import { createApi } from "../src/api";
import { createSql } from "./utils/sqlite/sql";

test("account", async () => {
  const api = await createApi(createSql());
  expect(await api.getAccounts({})).toEqual([]);
  const accountA: Account = {
    author: "fred",
    secret: "",
    nickname: "Fred",
    settings: {
      language: "it",
      theme: "dark",
      animations: "enabled",
      connectivity: {
        hyperswarm: { enabled: false },
        bridge: { server: { enabled: false }, clients: [] },
      },
    },
  };
  await api.addAccount(accountA);
  expect(await api.getAccount({ author: "fred" })).toEqual(accountA);
  expect(await api.getAccounts({})).toEqual([accountA]);
  const accountB: Account = {
    author: "fred",
    secret: "",
    nickname: "Macco",
    settings: {
      language: "en",
      theme: "light",
      animations: "disabled",
      connectivity: {
        hyperswarm: { enabled: false },
        bridge: { server: { enabled: false }, clients: [] },
      },
    },
  };
  await api.addAccount(accountB);
  expect(await api.getAccount({ author: "fred" })).toEqual(accountB);
  expect(await api.getAccounts({})).toEqual([accountB]);
  await api.stop();
});
