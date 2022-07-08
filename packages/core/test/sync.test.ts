import { createApi } from "../src/api";
import { createSql } from "./sqlite/sql";
import { createSync } from "../src/sync";
import { createBridgeServer } from "../src/components/bridge/bridgeServer";
import { Composition } from "@memita-2/ui";
import { createBridgeSwarm } from "../src/components/swarm/bridgeSwarm";

test("sync one composition", async () => {
  const bridgeServer = await createBridgeServer();
  const aSql = createSql();
  const aApi = await createApi(aSql, {});
  const bSql = createSql();
  const bApi = await createApi(bSql, {});
  const { onConnection: aOnConnection, sync: aSync } = createSync({
    sql: aSql,
    api: aApi,
  });
  const { onConnection: bOnConnection, sync: bSync } = createSync({
    sql: bSql,
    api: bApi,
  });
  const connected = deferable<void>();
  createBridgeSwarm(bridgeServer.port, "127.0.01")(aOnConnection);
  createBridgeSwarm(
    bridgeServer.port,
    "127.0.01"
  )((connection) => {
    connected.resolve();
    bOnConnection(connection);
  });
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
  await bridgeServer.close();
});

function deferable<V>() {
  let resolve: (value: V) => void = undefined as any;
  let reject: (error: any) => void = undefined as any;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
