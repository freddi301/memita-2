import { Account } from "@memita-2/ui";
import { createApi } from "../src/api";
import { createBridgeServer } from "../src/connectivity/bridge/bridgeServer";
import { createTables } from "../src/tables";
import { createSqlDatabase } from "./utils/sqlite/sql";

jest.setTimeout(30 * 1000);

test("account", async () => {
  const api = await createApi({ tables: await createTables(await createSqlDatabase()), filesPath: "" });
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
        lan: { enabled: false },
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
        lan: { enabled: false },
      },
    },
  };
  await api.addAccount(accountB);
  expect(await api.getAccount({ author: "fred" })).toEqual(accountB);
  expect(await api.getAccounts({})).toEqual([accountB]);
  await api.stop();
});

test("account delete", async () => {
  const api = await createApi({ tables: await createTables(await createSqlDatabase()), filesPath: "" });
  expect(await api.getAccounts({})).toEqual([]);
  const bridgeServer = createBridgeServer();
  await bridgeServer.start();
  const accountA: Account = {
    author: "fred",
    secret: "",
    nickname: "Fred",
    settings: {
      language: "it",
      theme: "dark",
      animations: "enabled",
      connectivity: {
        hyperswarm: { enabled: true },
        bridge: {
          server: { enabled: true },
          clients: [
            {
              host: "127.0.0.1",
              port: (await bridgeServer.getPort()) as number,
              enabled: true,
            },
          ],
        },
        lan: { enabled: true },
      },
    },
  };
  await api.addAccount(accountA);
  expect(await api.getAccount({ author: "fred" })).toEqual(accountA);
  await api.deleteAccount(accountA);
  expect(await api.getAccounts({})).toEqual([]);
  await api.stop();
  await bridgeServer.stop();
});
