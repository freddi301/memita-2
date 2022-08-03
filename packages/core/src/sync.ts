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
    async getHashes(account: string) {
      return (
        await sql`
        SELECT crypto_hash
        FROM contacts
        WHERE account = ${account}
      `.all()
      ).map(({ crypto_hash }: any) => crypto_hash);
    },
    async hasHash(hash: string) {
      return (
        (
          await sql`
          SELECT crypto_hash
          FROM contacts
          WHERE crypto_hash = ${hash}
        `.all()
        ).map(({ crypto_hash }: any) => crypto_hash).length > 0
      );
    },
    async getData(account: string, hash: string) {
      return (
        await sql`
          SELECT account, author, nickname, label, version_timestamp
          FROM contacts
          WHERE account = ${account} AND crypto_hash = ${hash}
        `.all()
      )[0] as any;
    },
  };

  const directMessagesRepository = {
    async getHashes(account: string) {
      return (
        await sql`
        SELECT crypto_hash
        FROM direct_messages
        WHERE author = ${account} OR recipient = ${account}
      `.all()
      ).map(({ crypto_hash }: any) => crypto_hash);
    },
    async hasHash(hash: string) {
      return (
        (
          await sql`SELECT crypto_hash FROM direct_messages WHERE crypto_hash = ${hash}`.all()
        ).map(({ crypto_hash }: any) => crypto_hash).length > 0
      );
    },
    async getData(account: string, hash: string) {
      return (
        await sql`
          SELECT author, recipient, quote, salt, content, version_timestamp
          FROM direct_messages
          WHERE crypto_hash = ${hash} AND (author = ${account} OR recipient = ${account})
        `.all()
      )[0] as any;
    },
  };

  const rpcServer = {
    async listContacts(account: string): Promise<Array<string>> {
      return await contactsRepository.getHashes(account);
    },
    async getContact(
      account: string,
      hash: string
    ): Promise<Contact | undefined> {
      return await contactsRepository.getData(account, hash);
    },
    async listDirectMessages(account: string): Promise<Array<string>> {
      return await directMessagesRepository.getHashes(account);
    },
    async getDirectMessage(
      account: string,
      hash: string
    ): Promise<DirectMessage | undefined> {
      return await directMessagesRepository.getData(account, hash);
    },
  };

  async function syncTable<Data>({
    account,
    list,
    has,
    get,
    add,
  }: {
    account: string;
    list(account: string): Promise<Array<string>>;
    has(hash: string): Promise<boolean>;
    get(account: string, hash: string): Promise<Data>;
    add(data: Data): Promise<void>;
  }) {
    const hashes = await list(account);
    for (const hash of hashes) {
      if (!(await has(hash))) {
        const data = await get(account, hash);
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
        const accounts = await api.getAccounts({});
        for (const { author: account } of accounts) {
          try {
            await syncTable({
              account,
              list: client.listContacts,
              has: contactsRepository.hasHash,
              get: client.getContact,
              add: api.addContact,
            });
            await syncTable({
              account,
              list: client.listDirectMessages,
              has: directMessagesRepository.hasHash,
              get: client.getDirectMessage,
              add: api.addDirectMessage,
            });
          } catch (error) {
            console.error(error);
            syncs.delete(sync);
          }
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
