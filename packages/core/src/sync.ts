import { Duplex } from "stream";
import { Api, Composition } from "@memita-2/ui";
import { createRpcClient, createRpcServer } from "./components/rpc";
import {
  CryptoHashableDataRepository,
  createCryptoHashableDataSyncRpcServer,
  syncCryptoHashableData,
  CryptoHashableDataSyncRPC,
} from "./components/cryptoHashableDataSync";
import { Sql } from "./components/sql";
import { cryptoHashFunction } from "./components/cryptoHashFunction";

export function createSync({ sql, api }: { sql: Sql; api: Api }) {
  const repository: CryptoHashableDataRepository<string, Composition> = {
    async getHashes() {
      return (await sql`SELECT crypto_hash FROM compositions`.all()).map(
        ({ crypto_hash }: any) => crypto_hash
      );
    },
    async hasHash(hash) {
      return (
        (
          await sql`SELECT crypto_hash FROM compositions WHERE crypto_hash = ${hash}`.all()
        ).map(({ crypto_hash }: any) => crypto_hash).length > 0
      );
    },
    async getData(hash) {
      return (
        await sql`SELECT author, channel, recipient, quote, salt, content, version_timestamp FROM compositions WHERE crypto_hash = ${hash}`.all()
      )[0] as any;
    },
    async addData(data) {
      await api.addComposition(data);
    },
    hashFunction: cryptoHashFunction,
  };

  const syncs = new Set<() => void>();

  return {
    onConnection(stream: Duplex) {
      createRpcServer(
        createCryptoHashableDataSyncRpcServer(repository),
        stream
      );
      const client =
        createRpcClient<CryptoHashableDataSyncRPC<string, Composition>>(stream);
      const sync = async () => {
        await syncCryptoHashableData(repository, client);
      };
      syncs.add(sync);
      stream.once("end", () => syncs.delete(sync));
    },
    async sync() {
      await Promise.all(Array.from(syncs.values()).map((sync) => sync()));
    },
  };
}
