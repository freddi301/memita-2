import { Account } from "@memita-2/ui";
import { createApi } from "../src/api";
import { createBridgeServer } from "../src/components/bridge/bridgeServer";
import { createSql } from "./sqlite/sqlite3";

test("bridge client toggle", async () => {
  const server = await createBridgeServer();
  const api = await createApi(createSql());
  const account: Account = {
    author: "fred",
    nickname: "Fred",
    settings: {
      theme: "dark",
      animations: "disabled",
      language: "en",
      connectivity: {
        hyperswarm: { enabled: false },
        bridge: {
          clients: [{ enabled: false, host: "127.0.0.1", port: server.port }],
        },
      },
    },
  };
  await api.addAccount(account);
  expect(await api.getConnections("fred")).toEqual({
    hyperswarm: { connections: 0 },
    bridge: [{ online: false, connections: 0 }],
  });
  account.settings.connectivity.bridge.clients[0].enabled = true;
  await api.addAccount(account);
  expect(await api.getConnections("fred")).toEqual({
    hyperswarm: { connections: 0 },
    bridge: [{ online: true, connections: 0 }],
  });
  account.settings.connectivity.bridge.clients[0].enabled = false;
  await api.addAccount(account);
  expect(await api.getConnections("fred")).toEqual({
    hyperswarm: { connections: 0 },
    bridge: [{ online: false, connections: 0 }],
  });
  account.settings.connectivity.bridge.clients[0].enabled = true;
  await api.addAccount(account);
  expect(await api.getConnections("fred")).toEqual({
    hyperswarm: { connections: 0 },
    bridge: [{ online: true, connections: 0 }],
  });
  account.settings.connectivity.bridge.clients[0].enabled = false;
  await api.addAccount(account);
  expect(await api.getConnections("fred")).toEqual({
    hyperswarm: { connections: 0 },
    bridge: [{ online: false, connections: 0 }],
  });
  await api.stop();
});
