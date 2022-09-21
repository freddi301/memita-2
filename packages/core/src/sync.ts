import { Duplex } from "stream";
import { Api } from "@memita-2/ui";
import { createDuplexCbor, createRpcClient, createRpcServer } from "./components/rpc";
import { createNonce, cryptoHashFunction, decrypt, encrypt, sign, verify } from "./components/crypto";
import { Contact, PrivateMessage, PublicMessage } from "@memita-2/ui";
import { createMultiplexer } from "./components/multiplexer";
import { TablesDataGatewayInstance } from "./tables";
import _ from "lodash";

export function createSync({ api, tables }: { api: Api; tables: TablesDataGatewayInstance }) {
  type Repository<Data> = {
    getHashes(requirerAuthor: string, providerAuthor: string): Promise<Array<string>>;
    hasHash(hash: string): Promise<boolean>;
    getData(requirerAuthor: string, providerAuthor: string, hash: string): Promise<Data | undefined>;
  };
  const contactsRepository: Repository<Contact> = {
    async getHashes(requirerAuthor, providerAuthor) {
      if (requirerAuthor !== providerAuthor) return [];
      return (await tables.table("contacts").query({ where: { account: requirerAuthor } })).map((contact) => contact.crypto_hash);
    },
    async hasHash(hash) {
      return await tables.table("contacts").has({ crypto_hash: hash });
    },
    async getData(requirerAuthor, providerAuthor, hash) {
      if (requirerAuthor !== providerAuthor) return;
      return _.omit(await tables.table("contacts").get({ crypto_hash: hash }), ["crypto_hash"]);
    },
  };

  const privateMessagesRepository: Repository<PrivateMessage> = {
    async getHashes(requirerAuthor, providerAuthor) {
      const sent = (await tables.table("private_messages").query({ where: { author: providerAuthor, recipient: requirerAuthor } })).map(
        (privateMessage) => privateMessage.crypto_hash
      );
      const received = (await tables.table("private_messages").query({ where: { author: requirerAuthor, recipient: providerAuthor } })).map(
        (privateMessage) => privateMessage.crypto_hash
      );
      return [...sent, ...received];
    },
    async hasHash(hash) {
      return await tables.table("private_messages").has({ crypto_hash: hash });
    },
    async getData(requirerAuthor, providerAuthor, hash) {
      const privateMessage = await tables.table("private_messages").get({ crypto_hash: hash });
      if (!privateMessage) return;
      if (
        (privateMessage.author === providerAuthor && privateMessage.recipient === requirerAuthor) ||
        (privateMessage.author === requirerAuthor && privateMessage.recipient === providerAuthor)
      )
        return _.omit({ ...privateMessage, attachments: JSON.parse(privateMessage.attachments) }, ["crypto_hash"]);
    },
  };

  const publicMessagesRepository: Repository<PublicMessage> = {
    async getHashes(requirerAuthor, providerAuthor) {
      return (await tables.table("public_messages").query({ where: { author: providerAuthor } })).map(
        (publicMessage) => publicMessage.crypto_hash
      );
    },
    async hasHash(hash) {
      return await tables.table("public_messages").has({ crypto_hash: hash });
    },
    async getData(requirerAuthor, providerAuthor, hash) {
      const publicMessage = await tables.table("public_messages").get({ crypto_hash: hash });
      if (!publicMessage) return;
      return _.omit({ ...publicMessage, attachments: JSON.parse(publicMessage.attachments) }, ["crypto_hash"]);
    },
  };

  const rpcServer = {
    async listAuthors() {
      const accounts = await api.getAccounts({});
      const authors = accounts.map((account) => account.author);
      return authors;
    },
    async listContacts(requirerAuthor: string, providerAuthor: string): Promise<Array<string>> {
      return await contactsRepository.getHashes(requirerAuthor, providerAuthor);
    },
    async getContact(requirerAuthor: string, providerAuthor: string, nonce: string, hash: string): Promise<Uint8Array | undefined> {
      const contact = await contactsRepository.getData(requirerAuthor, providerAuthor, hash);
      if (!contact) return;
      const account = await api.getAccount({ author: providerAuthor });
      if (!account) return;
      const encrypted = await encrypt(contact, nonce, account.secret, requirerAuthor);
      return encrypted;
    },
    async listPrivateMessages(requirerAuthor: string, providerAuthor: string): Promise<Array<string>> {
      return await privateMessagesRepository.getHashes(requirerAuthor, providerAuthor);
    },
    async getPrivateMessage(requirerAuthor: string, providerAuthor: string, nonce: string, hash: string): Promise<Uint8Array | undefined> {
      const privateMessage = await privateMessagesRepository.getData(requirerAuthor, providerAuthor, hash);
      if (!privateMessage) return;
      const account = await api.getAccount({ author: providerAuthor });
      if (!account) return;
      const encrypted = await encrypt(privateMessage, nonce, account.secret, requirerAuthor);
      return encrypted;
    },
    async listPublicMessages(requirerAuthor: string, providerAuthor: string): Promise<Array<string>> {
      return await publicMessagesRepository.getHashes(requirerAuthor, providerAuthor);
    },
    async getPublicMessage(requirerAuthor: string, providerAuthor: string, nonce: string, hash: string): Promise<Uint8Array | undefined> {
      const publicMessage = await privateMessagesRepository.getData(requirerAuthor, providerAuthor, hash);
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
    list(requirerAuthor: string, providerAuthor: string): Promise<Array<string>>;
    has(hash: string): Promise<boolean>;
    get(requirerAuthor: string, providerAuthor: string, nonce: string, hash: string): Promise<Uint8Array | undefined>;
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
          type === "encrypted" ? await decrypt(data, nonce, localAccount.secret, remoteAuthor) : await verify(data, remoteAuthor);
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
      const multiplexer = createMultiplexer(stream, (stream, header) => {
        if (header.toString("utf8") === "blocks") {
          const objectStream = createDuplexCbor(stream);
          createRpcServer(rpcServer, objectStream);
        } else {
          throw new Error();
        }
      });
      const objectStream = createDuplexCbor(multiplexer.createStream(Buffer.from("blocks")));
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
                list: client.listPrivateMessages,
                has: privateMessagesRepository.hasHash,
                get: client.getPrivateMessage,
                add: api.addPrivateMessage,
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
