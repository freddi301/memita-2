import { Duplex } from "stream";
import { Api } from "@memita-2/ui";
import {
  createDuplexCbor,
  createRpcClient,
  createRpcServer,
} from "./components/rpc";
import {
  CryptoHashableDataRepository,
  createCryptoHashableDataSyncRpcServer,
  syncCryptoHashableData,
  CryptoHashableDataSyncRPC,
} from "./components/cryptoHashableDataSync";
import { Sql } from "./components/sql";
import { cryptoHashFunction } from "./components/crypto";
import { Contact, DirectMessage } from "@memita-2/ui/dist/api";

export function createSync({ sql, api }: { sql: Sql; api: Api }) {
  const contactsRepository: CryptoHashableDataRepository<string, Contact> = {
    async getHashes() {
      return (await sql`SELECT crypto_hash FROM contacts`.all()).map(
        ({ crypto_hash }: any) => crypto_hash
      );
    },
    async hasHash(hash) {
      return (
        (
          await sql`SELECT crypto_hash FROM contacts WHERE crypto_hash = ${hash}`.all()
        ).map(({ crypto_hash }: any) => crypto_hash).length > 0
      );
    },
    async getData(hash) {
      return (
        await sql`SELECT account, author, nickname, label, version_timestamp FROM contacts WHERE crypto_hash = ${hash}`.all()
      )[0] as any;
    },
    async addData(data) {
      await api.addContact(data);
    },
    hashFunction: cryptoHashFunction,
  };

  const directMessagesRepository: CryptoHashableDataRepository<
    string,
    DirectMessage
  > = {
    async getHashes() {
      return (await sql`SELECT crypto_hash FROM direct_messages`.all()).map(
        ({ crypto_hash }: any) => crypto_hash
      );
    },
    async hasHash(hash) {
      return (
        (
          await sql`SELECT crypto_hash FROM direct_messages WHERE crypto_hash = ${hash}`.all()
        ).map(({ crypto_hash }: any) => crypto_hash).length > 0
      );
    },
    async getData(hash) {
      return (
        await sql`SELECT author, recipient, quote, salt, content, version_timestamp FROM direct_messages WHERE crypto_hash = ${hash}`.all()
      )[0] as any;
    },
    async addData(data) {
      await api.addDirectMessage(data);
    },
    hashFunction: cryptoHashFunction,
  };

  const repositories = {
    contacts: contactsRepository,
    directMessages: directMessagesRepository,
  };

  const syncs = new Set<() => void>();

  return {
    onConnection(stream: Duplex) {
      const objectStream = createDuplexCbor(stream);
      createRpcServer(
        createCryptoHashableDataSyncRpcServer({
          contacts: contactsRepository,
          directMessages: directMessagesRepository,
        }),
        objectStream
      );
      const client = createRpcClient<
        CryptoHashableDataSyncRPC<
          string,
          {
            contacts: Contact;
            directMessages: DirectMessage;
          }
        >
      >(objectStream);
      const sync = async () => {
        try {
          await syncCryptoHashableData(repositories, client);
        } catch (error) {
          console.error(error);
          syncs.delete(sync);
        }
      };
      syncs.add(sync);
      objectStream.once("end", () => {
        objectStream.end();
        syncs.delete(sync);
      });
    },
    async sync() {
      await Promise.all(Array.from(syncs.values()).map((sync) => sync()));
    },
  };
}
