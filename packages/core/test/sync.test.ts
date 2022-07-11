import { createApi } from "../src/api";
import { createSql } from "./sqlite/sql";
import { createSync } from "../src/sync";
import { createBridgeServer } from "../src/components/bridge/bridgeServer";
import { Composition } from "@memita-2/ui";
import { createBridgeClient } from "../src/components/bridge/bridgeClient";
import { deferable } from "./deferable";

test("sync one composition", async () => {
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
  const compositionA: Composition = {
    author: "fred",
    channel: "",
    recipient: "",
    quote: "",
    salt: "1",
    content: "hello",
    version_timestamp: 1,
  };
  await aApi.addComposition(compositionA);
  expect(await aApi.getCompositions({ account: "fred" })).toEqual([
    compositionA,
  ]);
  await connected.promise;
  await bSync();
  expect(await bApi.getCompositions({ account: "fred" })).toEqual([
    compositionA,
  ]);
  await bridgeServer.stop();
  await aApi.stop();
  await bApi.stop();
});
