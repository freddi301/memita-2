import type { Api } from "@memita-2/ui";
import { createSync } from "./sync";
import { TablesDataGatewayInstance } from "./tables";
import { cryptoCreateAsymmetricKeyPair, cryptoHashFunction, cryptoHashStream } from "./components/crypto";
import { createHyperSwarm } from "./connectivity/swarm/hyperSwarm";
import { createBridgeClient } from "./connectivity/bridge/bridgeClient";
import { createBridgeServer } from "./connectivity/bridge/bridgeServer";
import { createLanSwarm } from "./connectivity/swarm/lanSwarm";
import fs from "fs";
import path from "path";
import _ from "lodash";

export async function createApi({ tables, filesPath }: { filesPath: string; tables: TablesDataGatewayInstance }) {
  let stopped = false;
  const api: Api = {
    async addAccount({ author, secret, nickname, settings }) {
      await tables.table("accounts").set({ author, secret, nickname, settings: JSON.stringify(settings) });
      await connectAccounts();
    },
    async deleteAccount({ author }) {
      await tables.table("accounts").del({ author });
      await disconnectAccounts();
    },
    async getAccount({ author }) {
      const result = await tables.table("accounts").get({ author });
      if (result) return { ...result, settings: JSON.parse(result.settings) };
    },
    async getAccounts({}) {
      const result = await tables.table("accounts").query({ order: [["nickname", "ascending"]] });
      return result.map((account: any) => ({
        ...account,
        settings: JSON.parse(account.settings),
      }));
    },
    async generateAccount() {
      const { publicKey, privateKey } = await cryptoCreateAsymmetricKeyPair();
      return { author: publicKey, secret: privateKey };
    },
    async addContact({ account, author, nickname, label, version_timestamp }) {
      const crypto_hash = await cryptoHashFunction({
        account,
        author,
        nickname,
        label,
        version_timestamp,
      });
      await tables.table("contacts").set({
        crypto_hash,
        account,
        author,
        nickname,
        label,
        version_timestamp,
      });
    },
    async getContact({ account, author }) {
      const all = await tables.table("contacts").query({ where: { account, author } });
      return _.maxBy(all, (contact) => contact.version_timestamp);
    },
    async getContacts({ account, nickname }) {
      const all = await tables.table("contacts").query({ where: { account } });
      return _.filter(
        _.orderBy(
          _.values(
            _.mapValues(
              _.groupBy(all, (contact) => contact.author),
              (contacts) => _.maxBy(contacts, (contact) => contact.version_timestamp)!
            )
          ),
          (contact) => contact.nickname
        ),
        (contact) => (nickname ? contact.nickname.includes(nickname) : true)
      );
    },
    async addPrivateMessage({ author, recipient, quote, salt, content, attachments, version_timestamp }) {
      const crypto_hash = await cryptoHashFunction({
        author,
        recipient,
        quote,
        salt,
        content,
        attachments,
        version_timestamp,
      });
      await tables
        .table("private_messages")
        .set({ crypto_hash, author, recipient, quote, salt, content, attachments: JSON.stringify(attachments), version_timestamp });
    },
    async getAttachment(filePath: string) {
      const { size } = await fs.promises.stat(filePath);
      const fileStream = fs.createReadStream(filePath);
      const hash = await cryptoHashStream(fileStream);
      await fs.promises.mkdir(filesPath, { recursive: true });
      await fs.promises.copyFile(filePath, path.join(filesPath, hash));
      return { hash, size };
    },
    async getAttachmentUri(hash: string) {
      return path.join(filesPath, hash);
    },
    async getConversation({ account, other }) {
      const all = await tables.table("private_messages").query({});
      const filtered = _.filter(
        all,
        (privateMessage) =>
          (privateMessage.author === account && privateMessage.recipient === other) ||
          (privateMessage.author === other && privateMessage.recipient === account)
      );
      const grouped = _.groupBy(
        filtered,
        (privateMessage) => `${privateMessage.author}-${privateMessage.recipient}-${privateMessage.salt}`
      );
      const mostRecent = _.mapValues(
        grouped,
        (privateMessages) => _.maxBy(privateMessages, (privateMessage) => privateMessage.version_timestamp)!
      );
      const ordered = _.orderBy(mostRecent, (privateMessage) => privateMessage.version_timestamp);
      return ordered.map((privateMessage) => ({ ...privateMessage, attachments: JSON.parse(privateMessage.attachments) }));
    },
    async getConversations({ account }) {
      const all = await tables.table("private_messages").query({});
      const filtered = _.filter(all, (privateMessage) => privateMessage.author === account || privateMessage.recipient === account);
      const grouped = _.groupBy(
        filtered,
        (privateMessage) =>
          `${_.max([privateMessage.author, privateMessage.recipient])}-${_.min([privateMessage.author, privateMessage.recipient])}`
      );
      const mostRecent = _.mapValues(
        grouped,
        (privateMessages) => _.maxBy(privateMessages, (privateMessage) => privateMessage.version_timestamp)!
      );
      const ordered = _.orderBy(mostRecent, (privateMessage) => privateMessage.version_timestamp);
      return Promise.all(
        ordered.map(async (privateMessage) => {
          const other = privateMessage.author === account ? privateMessage.recipient : privateMessage.author;
          const contact = await api.getContact({ account, author: other });
          return {
            author: privateMessage.author,
            recipient: privateMessage.recipient,
            nickname: contact?.nickname ?? "",
            content: privateMessage.content,
            version_timestamp: privateMessage.version_timestamp,
          };
        })
      );
    },
    async addPublicMessage({ author, quote, salt, content, attachments, version_timestamp }) {
      const crypto_hash = await cryptoHashFunction({
        author,
        quote,
        salt,
        content,
        attachments,
        version_timestamp,
      });
      await tables
        .table("public_messages")
        .set({ crypto_hash, author, quote, salt, content, attachments: JSON.stringify(attachments), version_timestamp });
    },
    async getPublicMessages({ account, author }) {
      const all = await tables.table("public_messages").query({});
      const filtered = _.filter(all, (publicMessage) => publicMessage.author === author);
      const grouped = _.groupBy(filtered, (publicMessage) => `${publicMessage.author}-${publicMessage.salt}`);
      const mostRecent = _.mapValues(
        grouped,
        (publicMessages) => _.maxBy(publicMessages, (publicMessage) => publicMessage.version_timestamp)!
      );
      const ordered = _.orderBy(mostRecent, (publicMessage) => -publicMessage.version_timestamp);
      return ordered.map((publicMessage) => ({ ...publicMessage, attachments: JSON.parse(publicMessage.attachments) }));
    },
    async getFeed({ account }) {
      const all = await tables.table("public_messages").query({});
      const grouped = _.groupBy(all, (publicMessage) => `${publicMessage.author}-${publicMessage.salt}`);
      const mostRecent = _.mapValues(
        grouped,
        (publicMessages) => _.maxBy(publicMessages, (publicMessage) => publicMessage.version_timestamp)!
      );
      const ordered = _.orderBy(mostRecent, (publicMessage) => -publicMessage.version_timestamp);
      return ordered.map((publicMessage) => ({ ...publicMessage, attachments: JSON.parse(publicMessage.attachments) }));
    },
    async getConnections(account) {
      const instances = connectivityModuleInstances.get(account);
      if (!instances) return;
      const serverPort = await instances.bridgeServer.getPort();
      return {
        hyperswarm: {
          connections: await instances.hyperswarm.getConnections(),
        },
        bridge: {
          server: serverPort
            ? {
                port: serverPort,
                adresses: await instances.bridgeServer.getAddresses(),
                connections: await instances.bridgeServer.getConnections(),
              }
            : undefined,
          clients: await Promise.all(
            instances.bridgeClients.map(async (bridge) => ({
              online: await bridge.isOnline(),
              connections: await bridge.getConnections(),
            }))
          ),
        },
        lan: {
          connections: await instances.lan.getConnections(),
        },
      };
    },
    async stop() {
      if (!stopped) {
        stopped = true;
        for (const [, instances] of connectivityModuleInstances) {
          await instances.hyperswarm.stop();
          for (const bridgeClient of instances.bridgeClients) {
            await bridgeClient.stop();
          }
          await instances.bridgeServer.stop();
          await instances.lan.stop();
        }
        await tables.close();
      }
      await syncLoop;
    },
  };

  const { onConnection, sync } = createSync({ api, tables });
  const syncLoop = (async () => {
    while (!stopped) {
      await sync();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  })();

  type ConnectivityModuleInstances = {
    hyperswarm: ReturnType<typeof createHyperSwarm>;
    bridgeServer: ReturnType<typeof createBridgeServer>;
    bridgeClients: Array<ReturnType<typeof createBridgeClient>>;
    lan: ReturnType<typeof createLanSwarm>;
  };
  const connectivityModuleInstances = new Map<string, ConnectivityModuleInstances>();

  await connectAccounts();
  async function connectAccounts() {
    const accounts = await api.getAccounts({});
    for (const account of accounts) {
      let instances = connectivityModuleInstances.get(account.author) as ConnectivityModuleInstances;
      if (!instances) {
        instances = {
          hyperswarm: createHyperSwarm(onConnection),
          bridgeServer: createBridgeServer(),
          bridgeClients: account.settings.connectivity.bridge.clients.map(() => createBridgeClient(onConnection)),
          lan: createLanSwarm(onConnection),
        };
        connectivityModuleInstances.set(account.author, instances);
      }
      if (account.settings.connectivity.hyperswarm.enabled) {
        await instances.hyperswarm.start();
      } else {
        await instances.hyperswarm.stop();
      }
      if (account.settings.connectivity.bridge.server.enabled) {
        await instances.bridgeServer.start();
      } else {
        await instances.bridgeServer.stop();
      }
      for (let index = 0; index < account.settings.connectivity.bridge.clients.length; index++) {
        const bridge = account.settings.connectivity.bridge.clients[index];
        const instance = instances.bridgeClients[index];
        if (bridge.enabled) {
          await instance.start(bridge.port, bridge.host);
        } else {
          await instance.stop();
        }
      }
      if (account.settings.connectivity.lan.enabled) {
        await instances.lan.start();
      } else {
        await instances.lan.stop();
      }
    }
  }
  async function disconnectAccounts() {
    const accounts = await api.getAccounts({});
    for (const [author, instances] of connectivityModuleInstances) {
      if (!accounts.some((account) => account.author === author)) {
        await instances.hyperswarm.stop();
        for (const client of instances.bridgeClients) {
          await client.stop();
        }
        await instances.bridgeServer.stop();
        await instances.lan.stop();
        connectivityModuleInstances.delete(author);
      }
    }
  }

  return api;
}
