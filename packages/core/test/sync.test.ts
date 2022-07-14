import { createApi } from "../src/api";
import { createSql } from "./utils/sqlite/sql";
import { createSync } from "../src/sync";
import { createBridgeServer } from "../src/components/bridge/bridgeServer";
import { createBridgeClient } from "../src/components/bridge/bridgeClient";
import { deferable } from "./utils/deferable";
import { DirectMessage } from "@memita-2/ui/dist/api";

test("sync one direct message", async () => {
  const bridgeServer = createBridgeServer();
  await bridgeServer.start();
  const aSql = createSql();
  const aApi = await createApi(aSql);
  const bSql = createSql();
  const bApi = await createApi(bSql);
  const { onConnection: aOnConnection, sync: aSync } = createSync({
    sql: aSql,
    api: aApi,
  });
  const { onConnection: bOnConnection, sync: bSync } = createSync({
    sql: bSql,
    api: bApi,
  });
  const connected = deferable<void>();
  await createBridgeClient(aOnConnection).start(
    (await bridgeServer.getPort()) ?? 0,
    "127.0.01"
  );
  await createBridgeClient((connection) => {
    connected.resolve();
    bOnConnection(connection);
  }).start((await bridgeServer.getPort()) ?? 0, "127.0.01");
  const directMessageA: DirectMessage = {
    author: "fred",
    recipient: "alice",
    quote: "",
    salt: "1",
    content: "hello",
    version_timestamp: 1,
  };
  await aApi.addDirectMessage(directMessageA);
  expect(
    await aApi.getConversation({ account: "fred", other: "alice" })
  ).toEqual([directMessageA]);
  await connected.promise;
  await bSync();
  expect(
    await bApi.getConversation({ account: "fred", other: "alice" })
  ).toEqual([directMessageA]);
  await bridgeServer.stop();
  await aApi.stop();
  await bApi.stop();
});
