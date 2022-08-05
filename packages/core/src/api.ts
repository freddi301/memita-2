import type { Api } from "@memita-2/ui";
import { Sql } from "./components/sql";
import { createSync } from "./sync";
import { createTables, optimizeDb } from "./tables";
import {
  cryptoCreateAsymmetricKeyPair,
  cryptoHashFunction,
  cryptoHashStream,
} from "./components/crypto";
import { createHyperSwarm } from "./connectivity/swarm/hyperSwarm";
import { createBridgeClient } from "./connectivity/bridge/bridgeClient";
import { createBridgeServer } from "./connectivity/bridge/bridgeServer";
import { createLanSwarm } from "./connectivity/swarm/lanSwarm";
import fs from "fs";

export async function createApi(sql: Sql) {
  let stopped = false;
  await optimizeDb(sql);
  await createTables(sql);
  const api: Api = {
    async getDatabase() {
      return {
        accounts: await sql`SELECT * from accounts`.all(),
        contacts: await sql`SELECT * from contacts`.all(),
        channels: await sql`SELECT * from channels`.all(),
        direct_messages: await sql`SELECT * from direct_messages`.all(),
      };
    },
    async addAccount({ author, secret, nickname, settings }) {
      await sql`
        INSERT OR REPLACE INTO accounts (author, secret, nickname, settings)
        VALUES (${author}, ${secret}, ${nickname}, ${JSON.stringify(settings)})
      `.run();
      await connectAccounts();
    },
    async deleteAccount({ author }) {
      await sql`
        DELETE FROM accounts WHERE author = ${author}
      `.run();
      await disconnectAccounts();
    },
    async getAccount({ author }) {
      const result = (
        await sql`
          SELECT author, secret, nickname, settings
          FROM accounts
          WHERE author = ${author}
      `.all()
      )[0] as any;
      if (result) return { ...result, settings: JSON.parse(result.settings) };
    },
    async getAccounts({}) {
      const result = (await sql`
      SELECT author, secret, nickname, settings
      FROM accounts
      ORDER BY nickname ASC
    `.all()) as any;
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
      await sql`
        INSERT OR REPLACE INTO contacts (crypto_hash, account, author, nickname, label, version_timestamp)
        VALUES (${crypto_hash}, ${account}, ${author}, ${nickname}, ${label}, ${version_timestamp})
      `.run();
    },
    async getContact({ account, author }) {
      return (
        await sql`
          SELECT account, author, nickname, label, MAX(version_timestamp) AS version_timestamp
          FROM contacts
          WHERE account=${account} AND author=${author}
          GROUP BY account, author
        `.all()
      )[0] as any;
    },
    async getContacts({
      account,
      nickname = "DONTFILTER",
      label = "DONTFILTER",
    }) {
      const nicknameSearch = "%" + asSearch(nickname) + "%";
      return (await sql`
        SELECT account, author, nickname, label, MAX(version_timestamp) AS version_timestamp
        FROM contacts
        WHERE account = ${account}
        GROUP BY author
        HAVING
          (nickname LIKE CASE WHEN ${nickname} = 'DONTFILTER' THEN nickname ELSE ${nicknameSearch} END) AND
          (label = CASE WHEN ${label} = 'DONTFILTER' THEN label ELSE ${label} END)
        ORDER BY nickname ASC
      `.all()) as any;
    },
    async addDirectMessage({
      author,
      recipient,
      quote,
      salt,
      content,
      attachments,
      version_timestamp,
    }) {
      const crypto_hash = await cryptoHashFunction({
        author,
        recipient,
        quote,
        salt,
        content,
        version_timestamp,
      });
      await sql`
        INSERT OR REPLACE INTO direct_messages (crypto_hash, author, recipient, quote, salt, content, attachments, version_timestamp)
        VALUES (
          ${crypto_hash},
          ${author},
          ${recipient},
          ${quote},
          ${salt},
          ${content},
          ${JSON.stringify(attachments)},
          ${version_timestamp}
        )
      `.run();
    },
    async getAttachment(path: string) {
      const { size } = await fs.promises.stat(path);
      const fileStream = fs.createReadStream(path);
      const hash = await cryptoHashStream(fileStream);
      return { hash, size };
    },
    async getConversation({ account, other }) {
      const result = (await sql`
        SELECT author, recipient, quote, salt, content, attachments, MAX(version_timestamp) AS version_timestamp
        FROM direct_messages
        WHERE
          (author = ${account} AND recipient = ${other}) OR
          (author = ${other} AND recipient = ${account})
        GROUP BY author, recipient, salt
        ORDER BY MAX(version_timestamp) ASC
      `.all()) as any;
      return result.map((directMessage: any) => ({
        ...directMessage,
        attachments: JSON.parse(directMessage.attachments),
      }));
    },
    async getConversations({ account }) {
      return (await sql`
        SELECT
          direct_messages.author AS author,
          direct_messages.recipient AS recipient,
          contacts.nickname AS nickname,
          direct_messages.content AS content,
          MAX(direct_messages.version_timestamp) AS version_timestamp
        FROM direct_messages
        JOIN contacts ON
          contacts.account = ${account} AND
          (direct_messages.author = contacts.author OR direct_messages.recipient = contacts.author)
        WHERE direct_messages.author = ${account} OR direct_messages.recipient = ${account}
        GROUP BY
          MAX(direct_messages.author, direct_messages.recipient),
          MIN(direct_messages.author, direct_messages.recipient)
        ORDER BY MAX(direct_messages.version_timestamp) DESC
      `.all()) as any;
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
        await sql.close();
      }
      await syncLoop;
    },
  };

  function asSearch(string: string) {
    return string.replace(/[^a-zA-z0-9]/g, "");
  }

  const { onConnection, sync } = createSync({ sql, api });
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
  const connectivityModuleInstances = new Map<
    string,
    ConnectivityModuleInstances
  >();

  await connectAccounts();
  async function connectAccounts() {
    const accounts = await api.getAccounts({});
    for (const account of accounts) {
      let instances = connectivityModuleInstances.get(
        account.author
      ) as ConnectivityModuleInstances;
      if (!instances) {
        instances = {
          hyperswarm: createHyperSwarm(onConnection),
          bridgeServer: createBridgeServer(),
          bridgeClients: account.settings.connectivity.bridge.clients.map(() =>
            createBridgeClient(onConnection)
          ),
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
      for (
        let index = 0;
        index < account.settings.connectivity.bridge.clients.length;
        index++
      ) {
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
