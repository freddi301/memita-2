import { createApi } from "../src/api";
import { createSql } from "./utils/sqlite/sql";
import { createSync } from "../src/sync";
import { createBridgeServer } from "../src/connectivity/bridge/bridgeServer";
import { createBridgeClient } from "../src/connectivity/bridge/bridgeClient";
import { deferable } from "./utils/deferable";
import { Contact, DirectMessage } from "@memita-2/ui";
import { basicSettings } from "./utils/basic-settings";

async function createPair() {
  const bridgeServer = createBridgeServer();
  await bridgeServer.start();
  const aSql = createSql();
  const aApi = await createApi(aSql);
  const bSql = createSql();
  const bApi = await createApi(bSql);
  const a = createSync({
    sql: aSql,
    api: aApi,
  });
  const b = createSync({
    sql: bSql,
    api: bApi,
  });
  const aConnected = deferable<void>();
  const aBridgeClient = createBridgeClient((connection) => {
    aConnected.resolve();
    a.onConnection(connection);
  });
  await aBridgeClient.start((await bridgeServer.getPort()) ?? 0, "127.0.01");
  const bConnected = deferable<void>();
  const bBridgeClient = createBridgeClient((connection) => {
    bConnected.resolve();
    b.onConnection(connection);
  });
  await bBridgeClient.start((await bridgeServer.getPort()) ?? 0, "127.0.01");
  const stop = async () => {
    await aApi.stop();
    await bApi.stop();
    await bridgeServer.stop();
  };
  return [
    { api: aApi, connected: aConnected.promise, sync: a.sync },
    { api: bApi, connected: bConnected.promise, sync: b.sync },
    stop,
  ] as const;
}

test("sync one direct message", async () => {
  const [a, b, stop] = await createPair();
  const directMessageA: DirectMessage = {
    author: "fred",
    recipient: "alice",
    quote: "",
    salt: "1",
    content: "hello",
    version_timestamp: 1,
  };
  await a.api.addDirectMessage(directMessageA);
  expect(
    await a.api.getConversation({ account: "fred", other: "alice" })
  ).toEqual([directMessageA]);
  await b.connected;
  await b.sync();
  expect(
    await b.api.getConversation({ account: "fred", other: "alice" })
  ).toEqual([]);
  await b.api.addAccount({
    author: "fred",
    nickname: "",
    secret: "",
    settings: basicSettings,
  });
  await b.sync();
  expect(
    await b.api.getConversation({ account: "fred", other: "alice" })
  ).toEqual([directMessageA]);
  await stop();
});

test("sync one contact", async () => {
  const [a, b, stop] = await createPair();
  const contactA: Contact = {
    account: "fred",
    author: "alice",
    label: "",
    nickname: "Alice",
    version_timestamp: 1,
  };
  await a.api.addContact(contactA);
  expect(await a.api.getContacts({ account: "fred" })).toEqual([contactA]);
  await b.connected;
  await b.sync();
  expect(await b.api.getContacts({ account: "fred" })).toEqual([]);
  await b.api.addAccount({
    author: "fred",
    nickname: "",
    secret: "",
    settings: basicSettings,
  });
  await b.sync();
  expect(await b.api.getContacts({ account: "fred" })).toEqual([contactA]);

  await stop();
});
