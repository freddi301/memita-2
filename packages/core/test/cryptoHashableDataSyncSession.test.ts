import { createCryptoHashableDataSyncSession } from "../src/components/cryptoHashableDataSyncSession";
import { cryptoHashFunction } from "../src/components/cryptoHashFunction";
import { rpcTieTheKnot } from "../src/components/wireRpc";

test("createCryptoHashableDataSyncSession syncs data", async () => {
  const { server: aServer, actions: aActions } =
    createCryptoHashableDataSyncSession(
      async () => ["a", "b", "c"],
      cryptoHashFunction
    );
  // const { server: bServer, actions: bActions } =
  //   createCryptoHashableDataSyncSession(
  //     async () => ["c", "d", "e"],
  //     cryptoHashFunction
  //   );
  // const [aClient, bClient] = rpcTieTheKnot(aServer, bServer);
  // const { sync: aSync } = aActions(aClient);
  // const { sync: bSync } = bActions(bClient);
  // expect(await aSync()).toEqual(["d", "e"]);
  // expect(await bSync()).toEqual(["a", "b"]);
});
