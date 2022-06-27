import { createCryptoHashableDataSyncSession } from "../src/components/createCryptoHashableDataSyncSession";
import { rpcTieTheKnot } from "../src/components/wireRpc";

test("createCryptoHashableDataSyncSessionRPC syncs data", async () => {
  const hashFunction = (string: string) => "hashed:" + string;
  const { server: aServer, sync: aSync } = createCryptoHashableDataSyncSession(
    ["a", "b", "c"],
    hashFunction
  );
  const { server: bServer, sync: bSync } = createCryptoHashableDataSyncSession(
    ["c", "d", "e"],
    hashFunction
  );
  const [aClient, bClient] = rpcTieTheKnot(aServer, bServer);
  expect(await aSync(aClient)).toEqual(["d", "e"]);
  expect(await bSync(bClient)).toEqual(["a", "b"]);
});
