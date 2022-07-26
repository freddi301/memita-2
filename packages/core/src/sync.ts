import { Duplex } from "stream";
import { Api } from "@memita-2/ui";
import {
  createDuplexCbor,
  createRpcClient,
  createRpcServer,
} from "./components/rpc";
import { Sql } from "./components/sql";
import { cryptoHashFunction } from "./components/crypto";
import { Contact, DirectMessage } from "@memita-2/ui";

export function createSync({ sql, api }: { sql: Sql; api: Api }) {
  const contactsRepository = {
    async getHashes() {
      return (await sql`SELECT crypto_hash FROM contacts`.all()).map(
        ({ crypto_hash }: any) => crypto_hash
      );
    },
    async hasHash(hash: string) {
      return (
        (
          await sql`SELECT crypto_hash FROM contacts WHERE crypto_hash = ${hash}`.all()
        ).map(({ crypto_hash }: any) => crypto_hash).length > 0
      );
    },
    async getData(hash: string) {
      return (
        await sql`SELECT account, author, nickname, label, version_timestamp FROM contacts WHERE crypto_hash = ${hash}`.all()
      )[0] as any;
    },
  };

  const directMessagesRepository = {
    async getHashes() {
      return (await sql`SELECT crypto_hash FROM direct_messages`.all()).map(
        ({ crypto_hash }: any) => crypto_hash
      );
    },
    async hasHash(hash: string) {
      return (
        (
          await sql`SELECT crypto_hash FROM direct_messages WHERE crypto_hash = ${hash}`.all()
        ).map(({ crypto_hash }: any) => crypto_hash).length > 0
      );
    },
    async getData(hash: string) {
      return (
        await sql`SELECT author, recipient, quote, salt, content, version_timestamp FROM direct_messages WHERE crypto_hash = ${hash}`.all()
      )[0] as any;
    },
  };

  const rpcServer = {
    async listContacts(): Promise<Array<string>> {
      return await contactsRepository.getHashes();
    },
    async getContact(hash: string): Promise<Contact | undefined> {
      return await contactsRepository.getData(hash);
    },
    async listDirectMessages(): Promise<Array<string>> {
      return await directMessagesRepository.getHashes();
    },
    async getDirectMessage(hash: string): Promise<DirectMessage | undefined> {
      return await directMessagesRepository.getData(hash);
    },
  };

  async function syncTable<Data>({
    list,
    has,
    get,
    add,
  }: {
    list(): Promise<Array<string>>;
    has(hash: string): Promise<boolean>;
    get(hash: string): Promise<Data>;
    add(data: Data): Promise<void>;
  }) {
    const hashes = await list();
    for (const hash of hashes) {
      if (!(await has(hash))) {
        const data = await get(hash);
        if (!data) throw new Error("mising");
        if ((await cryptoHashFunction(data)) !== hash)
          throw new Error("corrupt");
        await add(data);
      }
    }
  }

  const syncs = new Set<() => void>();

  return {
    onConnection(stream: Duplex) {
      const objectStream = createDuplexCbor(stream);
      createRpcServer(rpcServer, objectStream);
      const client = createRpcClient<typeof rpcServer>(objectStream);
      const sync = async () => {
        try {
          await syncTable({
            list: client.listContacts,
            has: contactsRepository.hasHash,
            get: client.getContact,
            add: api.addContact,
          });
          await syncTable({
            list: client.listDirectMessages,
            has: directMessagesRepository.hasHash,
            get: client.getDirectMessage,
            add: api.addDirectMessage,
          });
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
