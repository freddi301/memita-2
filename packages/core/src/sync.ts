import { Duplex } from "stream";
import { Api } from "@memita-2/ui";
import {
  createDuplexCbor,
  createRpcClient,
  createRpcServer,
} from "./components/rpc";
import { Sql } from "./components/sql";
import {
  createNonce,
  cryptoHashFunction,
  decrypt,
  encrypt,
  sign,
  verify,
} from "./components/crypto";
import { Contact, DirectMessage, PublicMessage } from "@memita-2/ui";

export function createSync({ sql, api }: { sql: Sql; api: Api }) {
  type Repository<Data> = {
    getHashes(
      requirerAuthor: string,
      providerAuthor: string
    ): Promise<Array<string>>;
    hasHash(hash: string): Promise<boolean>;
    getData(
      requirerAuthor: string,
      providerAuthor: string,
      hash: string
    ): Promise<Data | undefined>;
  };
  const contactsRepository: Repository<Contact> = {
    async getHashes(requirerAuthor, providerAuthor) {
      return (
        await sql`
        SELECT crypto_hash
        FROM contacts
        WHERE account = ${requirerAuthor} AND account = ${providerAuthor}
      `.all()
      ).map(({ crypto_hash }: any) => crypto_hash);
    },
    async hasHash(hash) {
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
    async getData(requirerAuthor, providerAuthor, hash) {
      return (
        await sql`
          SELECT account, author, nickname, label, version_timestamp
          FROM contacts
          WHERE
            account = ${requirerAuthor} AND
            account = ${providerAuthor} AND
            crypto_hash = ${hash}
        `.all()
      )[0] as any;
    },
  };

  const directMessagesRepository: Repository<DirectMessage> = {
    async getHashes(requirerAuthor, providerAuthor) {
      return (
        await sql`
        SELECT crypto_hash
        FROM direct_messages
        WHERE
         (author = ${requirerAuthor} OR recipient = ${providerAuthor}) OR
         (author = ${providerAuthor} OR recipient = ${requirerAuthor})
      `.all()
      ).map(({ crypto_hash }: any) => crypto_hash);
    },
    async hasHash(hash) {
      return (
        (
          await sql`
            SELECT crypto_hash
            FROM direct_messages
            WHERE crypto_hash = ${hash}
          `.all()
        ).map(({ crypto_hash }: any) => crypto_hash).length > 0
      );
    },
    async getData(requirerAuthor, providerAuthor, hash) {
      return (
        await sql`
          SELECT author, recipient, quote, salt, content, attachments, version_timestamp
          FROM direct_messages
          WHERE
            (
              (author = ${requirerAuthor} OR recipient = ${providerAuthor}) OR
              (author = ${providerAuthor} OR recipient = ${requirerAuthor})
            ) AND
            crypto_hash = ${hash}
        `.all()
      ).map((directMessage: any) => ({
        ...directMessage,
        attachments: JSON.parse(directMessage.attachments),
      }))[0] as any;
    },
  };

  const publicMessagesRepository: Repository<PublicMessage> = {
    async getHashes(requirerAuthor, providerAuthor) {
      return (
        await sql`
        SELECT crypto_hash
        FROM public_messages
        WHERE author = ${providerAuthor}         
      `.all()
      ).map(({ crypto_hash }: any) => crypto_hash);
    },
    async hasHash(hash) {
      return (
        (
          await sql`
            SELECT crypto_hash
            FROM public_messages
            WHERE crypto_hash = ${hash}
          `.all()
        ).map(({ crypto_hash }: any) => crypto_hash).length > 0
      );
    },
    async getData(requirerAuthor, providerAuthor, hash) {
      return (
        await sql`
          SELECT author, quote, salt, content, attachments, version_timestamp
          FROM public_messages
          WHERE
            author = ${providerAuthor} AND     
            crypto_hash = ${hash}
        `.all()
      ).map((publicMessage: any) => ({
        ...publicMessage,
        attachments: JSON.parse(publicMessage.attachments),
      }))[0] as any;
    },
  };

  const rpcServer = {
    async listAuthors() {
      const accounts = await api.getAccounts({});
      const authors = accounts.map((account) => account.author);
      return authors;
    },
    async listContacts(
      requirerAuthor: string,
      providerAuthor: string
    ): Promise<Array<string>> {
      return await contactsRepository.getHashes(requirerAuthor, providerAuthor);
    },
    async getContact(
      requirerAuthor: string,
      providerAuthor: string,
      nonce: string,
      hash: string
    ): Promise<Uint8Array | undefined> {
      const contact = await contactsRepository.getData(
        requirerAuthor,
        providerAuthor,
        hash
      );
      if (!contact) return;
      const account = await api.getAccount({ author: providerAuthor });
      if (!account) return;
      const encrypted = await encrypt(
        contact,
        nonce,
        account.secret,
        requirerAuthor
      );
      return encrypted;
    },
    async listDirectMessages(
      requirerAuthor: string,
      providerAuthor: string
    ): Promise<Array<string>> {
      return await directMessagesRepository.getHashes(
        requirerAuthor,
        providerAuthor
      );
    },
    async getDirectMessage(
      requirerAuthor: string,
      providerAuthor: string,
      nonce: string,
      hash: string
    ): Promise<Uint8Array | undefined> {
      const directMessage = await directMessagesRepository.getData(
        requirerAuthor,
        providerAuthor,
        hash
      );
      if (!directMessage) return;
      const account = await api.getAccount({ author: providerAuthor });
      if (!account) return;
      const encrypted = await encrypt(
        directMessage,
        nonce,
        account.secret,
        requirerAuthor
      );
      return encrypted;
    },
    async listPublicMessages(
      requirerAuthor: string,
      providerAuthor: string
    ): Promise<Array<string>> {
      return await publicMessagesRepository.getHashes(
        requirerAuthor,
        providerAuthor
      );
    },
    async getPublicMessage(
      requirerAuthor: string,
      providerAuthor: string,
      nonce: string,
      hash: string
    ): Promise<Uint8Array | undefined> {
      const publicMessage = await directMessagesRepository.getData(
        requirerAuthor,
        providerAuthor,
        hash
      );
      if (!publicMessage) return;
      const account = await api.getAccount({ author: providerAuthor });
      if (!account) return;
      const signed = await sign(publicMessage, account.secret);
      return signed;
    },
  };

  async function syncTable<Data>({
    localAccount,
    remoteAuthor,
    list,
    has,
    get,
    add,
    type,
  }: {
    localAccount: { author: string; secret: string };
    remoteAuthor: string;
    list(
      requirerAuthor: string,
      providerAuthor: string
    ): Promise<Array<string>>;
    has(hash: string): Promise<boolean>;
    get(
      requirerAuthor: string,
      providerAuthor: string,
      nonce: string,
      hash: string
    ): Promise<Uint8Array | undefined>;
    add(data: Data): Promise<void>;
    type: "encrypted" | "signed";
  }) {
    const hashes = await list(localAccount.author, remoteAuthor);
    for (const hash of hashes) {
      if (!(await has(hash))) {
        const nonce = await createNonce();
        const data = await get(localAccount.author, remoteAuthor, nonce, hash);
        if (!data) throw new Error("mising");
        const opened =
          type === "encrypted"
            ? await decrypt(data, nonce, localAccount.secret, remoteAuthor)
            : await verify(data, remoteAuthor);
        console.log(opened, (await cryptoHashFunction(opened)) !== hash);
        if ((await cryptoHashFunction(opened)) !== hash) {
          throw new Error("corrupt");
        }
        await add(opened);
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
        const localAccounts = await api.getAccounts({});
        const remoteAuthors = await client.listAuthors();
        try {
          for (const localAccount of localAccounts) {
            for (const remoteAuthor of remoteAuthors) {
              if (localAccount.author === remoteAuthor) {
                await syncTable({
                  localAccount,
                  remoteAuthor,
                  list: client.listContacts,
                  has: contactsRepository.hasHash,
                  get: client.getContact,
                  add: api.addContact,
                  type: "encrypted",
                });
              }
              await syncTable({
                localAccount,
                remoteAuthor,
                list: client.listDirectMessages,
                has: directMessagesRepository.hasHash,
                get: client.getDirectMessage,
                add: api.addDirectMessage,
                type: "encrypted",
              });
              await syncTable({
                localAccount,
                remoteAuthor,
                list: client.listPublicMessages,
                has: publicMessagesRepository.hasHash,
                get: client.getPublicMessage,
                add: api.addPublicMessage,
                type: "signed",
              });
            }
          }
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
