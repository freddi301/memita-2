import type { Api } from "@memita-2/ui";
import { Sql } from "./components/sql";
import { createSync } from "./sync";
import { createTables, optimizeDb } from "./tables";
import { cryptoHashFunction } from "./components/cryptoHashFunction";
import { createHyperSwarm } from "./components/swarm/hyperSwarm";
import { createBridgeClient } from "./components/bridge/bridgeClient";

export async function createApi(sql: Sql) {
  await optimizeDb(sql);
  await createTables(sql);
  const api: Api = {
    async getDatabase() {
      return {
        accounts: await sql`SELECT * from accounts`.all(),
        contacts: await sql`SELECT * from contacts`.all(),
        channels: await sql`SELECT * from channels`.all(),
        compositions: await sql`SELECT * from compositions`.all(),
      };
    },
    async addAccount({ author, nickname, settings }) {
      await sql`
        INSERT OR REPLACE INTO accounts (author, nickname, settings)
        VALUES (${author}, ${nickname}, ${JSON.stringify(settings)})
      `.run();
    },
    async getAccount({ author }) {
      const result = (
        await sql`
          SELECT author, nickname, settings FROM accounts
          WHERE author = ${author}
      `.all()
      )[0] as any;
      if (result) return { ...result, settings: JSON.parse(result.settings) };
    },
    async getAccounts({ nickname = "DONTFILTER" }) {
      const nicknameSearch = "%" + asSearch(nickname) + "%";
      const result = (await sql`
      SELECT author, nickname, settings FROM accounts
      WHERE
        (nickname LIKE CASE WHEN ${nickname} = 'DONTFILTER' THEN nickname ELSE ${nicknameSearch} END)
      ORDER BY nickname ASC
    `.all()) as any;
      return result.map((account: any) => ({
        ...account,
        settings: JSON.parse(account.settings),
      }));
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
          SELECT account, author, nickname, label, MAX(version_timestamp) AS version_timestamp FROM contacts
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
          SELECT account, author, nickname, label, MAX(version_timestamp) AS version_timestamp FROM contacts
          WHERE account = ${account}
          GROUP BY author
          HAVING
            (nickname LIKE CASE WHEN ${nickname} = 'DONTFILTER' THEN nickname ELSE ${nicknameSearch} END) AND
            (label = CASE WHEN ${label} = 'DONTFILTER' THEN label ELSE ${label} END)
          ORDER BY nickname ASC
        `.all()) as any;
    },
    async addChannel({ account, channel, nickname, label, version_timestamp }) {
      const crypto_hash = await cryptoHashFunction({
        account,
        channel,
        nickname,
        label,
        version_timestamp,
      });
      await sql`
        INSERT OR REPLACE INTO channels (crypto_hash, account, channel, nickname, label, version_timestamp)
        VALUES (${crypto_hash}, ${account}, ${channel}, ${nickname}, ${label}, ${version_timestamp})
      `.run();
    },
    async getChannel({ account, channel }) {
      return (
        await sql`
          SELECT account, channel, nickname, label, MAX(version_timestamp) AS version_timestamp FROM channels
          WHERE account=${account} AND channel=${channel}
          GROUP BY account, channel
        `.all()
      )[0] as any;
    },
    async getChannels({
      account,
      nickname = "DONTFILTER",
      label = "DONTFILTER",
    }) {
      const nicknameSearch = "%" + asSearch(nickname) + "%";
      return (await sql`
          SELECT account, channel, nickname, label, MAX(version_timestamp) AS version_timestamp FROM channels
          WHERE account = ${account}
          GROUP BY channel
          HAVING
            (nickname LIKE CASE WHEN ${nickname} = 'DONTFILTER' THEN nickname ELSE ${nicknameSearch} END) AND
            (label = CASE WHEN ${label} = 'DONTFILTER' THEN label ELSE ${label} END)
          ORDER BY nickname ASC
        `.all()) as any;
    },
    async addComposition({
      author,
      channel,
      recipient,
      quote,
      salt,
      content,
      version_timestamp,
    }) {
      const crypto_hash = await cryptoHashFunction({
        author,
        channel,
        recipient,
        quote,
        salt,
        content,
        version_timestamp,
      });
      await sql`
        INSERT OR REPLACE INTO compositions (crypto_hash, author, channel, recipient, quote, salt, content, version_timestamp)
        VALUES (${crypto_hash}, ${author}, ${channel}, ${recipient}, ${quote}, ${salt}, ${content}, ${version_timestamp})
      `.run();
    },
    async getComposition({ account, author, channel, recipient, quote, salt }) {
      return (
        await sql`
        SELECT author, channel, recipient, quote, salt, content, MAX(version_timestamp) AS version_timestamp FROM compositions
        WHERE
          author = ${author} AND
          channel = ${channel} AND
          recipient = ${recipient} AND
          quote = ${quote} AND
          salt = ${salt}
        GROUP BY author, channel, recipient, quote, salt
      `.all()
      )[0] as any;
    },
    async getCompositions({
      account,
      author = "DONTFILTER",
      channel = "DONTFILTER",
      recipient = "DONTFILTER",
      quote = "DONTFILTER",
      content = "DONTFILTER",
    }) {
      const contentSearch = "%" + asSearch(content) + "%";
      return (await sql`
        SELECT author, channel, recipient, quote, salt, content, MAX(version_timestamp) AS version_timestamp FROM compositions
        WHERE
          (author = CASE WHEN ${author} = 'DONTFILTER' THEN author ELSE ${author} END) AND
          (channel = CASE WHEN ${channel} = 'DONTFILTER' THEN channel ELSE ${channel} END) AND
          (recipient = CASE WHEN ${recipient} = 'DONTFILTER' THEN recipient ELSE ${recipient} END) AND
          (quote = CASE WHEN ${quote} = 'DONTFILTER' THEN quote ELSE ${quote} END)
        GROUP BY author, channel, recipient, quote, salt
        HAVING
          (content LIKE CASE WHEN ${content} = 'DONTFILTER' THEN content ELSE ${contentSearch} END)
        ORDER BY MAX(version_timestamp) DESC
      `.all()) as any;
    },
    async getConversation({
      account,
      channel = "DONTFILTER",
      other = "DONTFILTER",
      quote = "DONTFILTER",
      content = "DONTFILTER",
    }) {
      const contentSearch = "%" + asSearch(content) + "%";
      return (await sql`
        SELECT author, channel, recipient, quote, salt, content, MAX(version_timestamp) AS version_timestamp FROM compositions
        WHERE
          (
            (author = ${account} AND (recipient = CASE WHEN ${other} = 'DONTFILTER' THEN recipient ELSE ${other} END)) OR
            (recipient = ${account} AND (author = CASE WHEN ${other} = 'DONTFILTER' THEN author ELSE ${other} END))
          ) AND
          (channel = CASE WHEN ${channel} = 'DONTFILTER' THEN channel ELSE ${channel} END) AND
          (quote = CASE WHEN ${quote} = 'DONTFILTER' THEN quote ELSE ${quote} END)
        GROUP BY author, channel, recipient, quote, salt
        HAVING
          (content LIKE CASE WHEN ${content} = 'DONTFILTER' THEN content ELSE ${contentSearch} END)
        ORDER BY MAX(version_timestamp) ASC
      `.all()) as any;
    },
    async getConversations({
      account = "DONTFILTER",
      channel = "DONTFILTER",
      content = "DONTFILTER",
    }) {
      const contentSearch = "%" + asSearch(content) + "%";
      return (await sql`
        SELECT author, channel, recipient, content, MAX(version_timestamp) AS version_timestamp FROM compositions
        WHERE 
          (channel = CASE WHEN ${channel} = 'DONTFILTER' THEN channel ELSE ${channel} END) OR
          (
            (author=CASE WHEN ${account} = 'DONTFILTER' THEN author ELSE ${account} END) OR
            (recipient=CASE WHEN ${account} = 'DONTFILTER' THEN recipient ELSE ${account} END)
          )
        GROUP BY MAX(author, recipient), MIN(author, recipient), channel
        HAVING
          (content LIKE CASE WHEN ${content} = 'DONTFILTER' THEN content ELSE ${contentSearch} END)
        ORDER BY MAX(version_timestamp) DESC
      `.all()) as any;
    },
    async getConnections(account) {
      const instances = connectivityModuleInstances.get(account);
      if (!instances) {
        return {
          hyperswarm: 0,
          bridge: [],
        };
      }
      return {
        hyperswarm: await instances.hyperswarm.getConnections(),
        bridge: await Promise.all(
          instances.bridge.map((bridge) => bridge.getConnections())
        ),
      };
    },
  };

  function asSearch(string: string) {
    return string.replace(/[^a-zA-z0-9]/g, "");
  }

  const { onConnection, sync } = createSync({ sql, api });
  (async () => {
    while (true) {
      await sync();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  })();

  type ConnectivityModuleInstances = {
    hyperswarm: ReturnType<typeof createHyperSwarm>;
    bridge: Array<ReturnType<typeof createBridgeClient>>;
  };
  const connectivityModuleInstances = new Map<
    string,
    ConnectivityModuleInstances
  >();

  connectAccounts();
  async function connectAccounts() {
    const accounts = await api.getAccounts({});
    for (const account of accounts) {
      let instances = connectivityModuleInstances.get(
        account.author
      ) as ConnectivityModuleInstances;
      if (!instances) {
        instances = {
          hyperswarm: createHyperSwarm(onConnection),
          bridge: account.settings.connectivity.bridge.clients.map((bridge) =>
            createBridgeClient(bridge.port, bridge.host, onConnection)
          ),
        };
        connectivityModuleInstances.set(account.author, instances);
      }
      if (account.settings.connectivity.hyperswarm.enabled) {
        await instances.hyperswarm.start();
      } else {
        await instances.hyperswarm.stop();
      }
      for (
        let index = 0;
        index < account.settings.connectivity.bridge.clients.length;
        index++
      ) {
        const bridge = account.settings.connectivity.bridge.clients[index];
        const instance = instances.bridge[index];
        if (bridge.enabled) {
          await instance.start();
        } else {
          await instance.stop();
        }
      }
    }
    setTimeout(connectAccounts, 1000);
  }

  return api;
}
