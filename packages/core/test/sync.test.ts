import { createApi } from "../src/api";
import { createSqlDatabase } from "./utils/sqlite/sql";
import { createSync } from "../src/sync";
import { createBridgeServer } from "../src/connectivity/bridge/bridgeServer";
import { createBridgeClient } from "../src/connectivity/bridge/bridgeClient";
import { deferable } from "./utils/deferable";
import { Contact, PrivateMessage } from "@memita-2/ui";
import { createTestAccount } from "./utils/createTestAccount";
import { createTables } from "../src/tables";

async function createPair() {
  const bridgeServer = createBridgeServer();
  await bridgeServer.start();
  const aTables = await createTables(await createSqlDatabase());
  const aApi = await createApi({ tables: aTables, filesPath: "" });
  const bTables = await createTables(await createSqlDatabase());
  const bApi = await createApi({ tables: bTables, filesPath: "" });
  const a = createSync({ tables: aTables, api: aApi });
  const b = createSync({ tables: bTables, api: bApi });
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

test("sync one direct message to self", async () => {
  const [a, b, stop] = await createPair();
  const fredAccount = await createTestAccount();
  const aliceAccount = await createTestAccount();
  const privateMessageA: PrivateMessage = {
    author: fredAccount.author,
    recipient: aliceAccount.author,
    quote: "",
    salt: "1",
    content: "hello",
    attachments: [],
    version_timestamp: 1,
  };
  await a.api.addAccount(fredAccount);
  await a.api.addPrivateMessage(privateMessageA);
  expect(
    await a.api.getConversation({
      account: fredAccount.author,
      other: aliceAccount.author,
    })
  ).toEqual([privateMessageA]);
  await b.connected;
  await b.sync();
  expect(
    await b.api.getConversation({
      account: fredAccount.author,
      other: aliceAccount.author,
    })
  ).toEqual([]);
  await b.api.addAccount(fredAccount);
  await b.sync();
  expect(
    await b.api.getConversation({
      account: fredAccount.author,
      other: aliceAccount.author,
    })
  ).toEqual([privateMessageA]);
  await stop();
});

test("sync one contact to self", async () => {
  const [a, b, stop] = await createPair();
  const fredAccount = await createTestAccount();
  const aliceAccount = await createTestAccount();
  const contactA: Contact = {
    account: fredAccount.author,
    author: aliceAccount.author,
    label: "",
    nickname: "Alice",
    version_timestamp: 1,
  };
  await a.api.addAccount(fredAccount);
  await a.api.addContact(contactA);
  expect(await a.api.getContacts({ account: fredAccount.author })).toEqual([contactA]);
  await b.connected;
  await b.sync();
  expect(await b.api.getContacts({ account: fredAccount.author })).toEqual([]);
  await b.api.addAccount(fredAccount);
  await b.sync();
  expect(await b.api.getContacts({ account: fredAccount.author })).toEqual([contactA]);
  await stop();
});
