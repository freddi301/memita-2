import { Account } from "@memita-2/ui";
import { createApi } from "../src/api";
import { createBridgeServer } from "../src/connectivity/bridge/bridgeServer";
import { createSql } from "./utils/sqlite/sqlite3";

test("bridge client toggle", async () => {
  const server = createBridgeServer();
  await server.start();
  const api = await createApi(createSql());
  const account: Account = {
    author: "fred",
    secret: "",
    nickname: "Fred",
    settings: {
      theme: "dark",
      animations: "disabled",
      language: "en",
      connectivity: {
        hyperswarm: { enabled: false },
        bridge: {
          server: { enabled: false },
          clients: [
            {
              enabled: false,
              host: "127.0.0.1",
              port: (await server.getPort()) ?? 0,
            },
          ],
        },
        lan: {
          enabled: false,
        },
      },
    },
  };
  await api.addAccount(account);
  expect(await api.getConnections("fred")).toEqual({
    hyperswarm: { connections: 0 },
    bridge: {
      server: undefined,
      clients: [{ online: false, connections: 0 }],
    },
    lan: { connections: 0 },
  });
  account.settings.connectivity.bridge.clients[0].enabled = true;
  await api.addAccount(account);
  expect(await api.getConnections("fred")).toEqual({
    hyperswarm: { connections: 0 },
    bridge: {
      server: undefined,
      clients: [{ online: true, connections: 0 }],
    },
    lan: { connections: 0 },
  });
  account.settings.connectivity.bridge.clients[0].enabled = false;
  await api.addAccount(account);
  expect(await api.getConnections("fred")).toEqual({
    hyperswarm: { connections: 0 },
    bridge: {
      server: undefined,
      clients: [{ online: false, connections: 0 }],
    },
    lan: { connections: 0 },
  });
  account.settings.connectivity.bridge.clients[0].enabled = true;
  await api.addAccount(account);
  expect(await api.getConnections("fred")).toEqual({
    hyperswarm: { connections: 0 },
    bridge: {
      server: undefined,
      clients: [{ online: true, connections: 0 }],
    },
    lan: { connections: 0 },
  });
  account.settings.connectivity.bridge.clients[0].enabled = false;
  await api.addAccount(account);
  expect(await api.getConnections("fred")).toEqual({
    hyperswarm: { connections: 0 },
    bridge: {
      server: undefined,
      clients: [{ online: false, connections: 0 }],
    },
    lan: { connections: 0 },
  });
  await server.stop();
  await api.stop();
});
