import { PassThrough } from "stream";
import duplexify from "duplexify";
import {
  createCryptoHashableDataSyncRpcServer,
  CryptoHashableDataRepository,
  CryptoHashableDataSyncRPC,
  syncCryptoHashableData,
} from "../src/components/cryptoHashableDataSync";
import {
  createDuplexCbor,
  createRpcClient,
  createRpcServer,
} from "../src/components/rpc";

test("cryptoHashableDataSync syncs data", async () => {
  const a = new PassThrough();
  const b = new PassThrough();
  const x = createDuplexCbor(duplexify(a, b));
  const y = createDuplexCbor(duplexify(b, a));
  createRpcServer(
    createCryptoHashableDataSyncRpcServer<string, string>(
      createRepoFromArray(["a", "b", "c"])
    ),
    x
  );
  const client = createRpcClient<CryptoHashableDataSyncRPC<string, string>>(y);
  const repository = createRepoFromArray(["c", "d", "e"]);
  await syncCryptoHashableData(repository, client);
  expect(Array.from(repository.map.values())).toEqual([
    "c",
    "d",
    "e",
    "a",
    "b",
  ]);
});

function createRepoFromArray(
  initial: Array<string>
): CryptoHashableDataRepository<string, string> & { map: Map<string, string> } {
  const hashFunction = (data: string) => "#" + data;
  const map = new Map(initial.map((data) => [hashFunction(data), data]));
  return {
    async getHashes() {
      return Array.from(map.keys());
    },
    async addData(data) {
      map.set(hashFunction(data), data);
    },
    async getData(hash) {
      const data = map.get(hash);
      if (!data) throw new Error();
      return data;
    },
    async hasHash(hash) {
      return map.has(hash);
    },
    hashFunction: async (data) => hashFunction(data),
    map,
  };
}
