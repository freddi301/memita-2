import type { Api } from "@memita-2/ui";
import { Sql } from "./sql";

export function createApi(sql: Sql) {
  const setup = Promise.all([
    optimizeDd(),

    sql`CREATE TABLE settings (
      pk TEXT NOT NULL,
      payload TEXT NOT NULL,
      PRIMARY KEY (pk)
    )`.run(),

    sql`CREATE TABLE accounts (
      author TEXT NOT NULL,
      nickname TEXT NOT NULL,
      version_timestamp INT NOT NUll,
      PRIMARY KEY (author, nickname, version_timestamp)
    )`.run(),

    sql`CREATE TABLE contacts (
      account TEXT NOT NULL,
      author TEXT NOT NULL,
      nickname TEXT NOT NULL,
      label TEXT NOT NULL,
      version_timestamp INT NOT NUll,
      PRIMARY KEY (account, author, nickname, label, version_timestamp)
    )`.run(),

    sql`CREATE TABLE channels (
      account TEXT NOT NULL,
      channel TEXT NOT NULL,
      nickname TEXT NOT NULL,
      label TEXT NOT NULL,
      version_timestamp INT NOT NUll,
      PRIMARY KEY (account, channel, nickname, label, version_timestamp)
    )`.run(),

    sql`CREATE TABLE compositions (
      author TEXT NOT NULL,
      channel TEXT NOT NULL,
      recipient TEXT NOT NULL,
      quote TEXT NOT NULL,
      salt TEXT NOT NULL,
      content TEXT NOT NULL,
      version_timestamp INTEGER NOT NULL,
      PRIMARY KEY (author, channel, recipient, quote, salt, content, version_timestamp)
    )`.run(),
  ]);

  async function optimizeDd() {
    // https://phiresky.github.io/blog/2020/sqlite-performance-tuning/
    // https://blog.devart.com/increasing-sqlite-performance.html
    await sql`PRAGMA journal_mode = WAL`.run();
    await sql`PRAGMA synchronous = normal`.run();
    await sql`PRAGMA temp_store = memory`.run();
    await sql`PRAGMA mmap_size = 30000000000`.run();
    await sql`PRAGMA optimize`.run();
    await sql`PRAGMA locking_mode = exclusive`.run();
  }

  const api: Api = {
    async getDatabase() {
      await setup;
      return [
        ...(await sql`SELECT * from accounts`.all()),
        ...(await sql`SELECT * from contacts`.all()),
        ...(await sql`SELECT * from compositions`.all()),
      ];
    },
    async setSettings(settings) {
      await setup;
      await sql`
        INSERT OR REPLACE INTO settings (pk, payload)
        VALUES ('settings', ${JSON.stringify(settings)})
      `.run();
    },
    async getSettings() {
      await setup;
      const rows = await sql`
        SELECT pk, payload FROM settings
      `.all();
      if (rows.length === 0) return;
      return JSON.parse((rows[0] as any).payload);
    },
    async addAccount({ author, nickname, version_timestamp }) {
      await setup;
      await sql`
        INSERT OR REPLACE INTO accounts (author, nickname, version_timestamp)
        VALUES (${author}, ${nickname}, ${version_timestamp})
      `.run();
    },
    async getAccount({ author }) {
      await setup;
      return await (
        sql`
        SELECT author, nickname, MAX(version_timestamp) AS version_timestamp FROM accounts
        WHERE author=${author}
        GROUP BY author
      ` as any
      )[0];
    },
    async getAccounts({ nickname = "DONTFILTER" }) {
      await setup;
      const nicknameSearch = "%" + asSearch(nickname) + "%";
      return (await sql`
          SELECT author, nickname, MAX(version_timestamp) AS version_timestamp FROM accounts
          GROUP BY author
          HAVING
            (nickname LIKE CASE WHEN ${nickname} = 'DONTFILTER' THEN nickname ELSE ${nicknameSearch} END)
          ORDER BY nickname ASC
        `.all()) as any;
    },
    async addContact({ account, author, nickname, label, version_timestamp }) {
      await setup;
      await sql`
        INSERT OR REPLACE INTO contacts (account, author, nickname, label, version_timestamp)
        VALUES (${account}, ${author}, ${nickname}, ${label}, ${version_timestamp})
      `.run();
    },
    async getContact({ account, author }) {
      await setup;
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
      await setup;
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
      await setup;
      await sql`
        INSERT OR REPLACE INTO channels (account, channel, nickname, label, version_timestamp)
        VALUES (${account}, ${channel}, ${nickname}, ${label}, ${version_timestamp})
      `.run();
    },
    async getChannel({ account, channel }) {
      await setup;
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
      await setup;
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
      await setup;
      await sql`
        INSERT OR REPLACE INTO compositions (author, channel, recipient, quote, salt, content, version_timestamp)
        VALUES (${author}, ${channel}, ${recipient}, ${quote}, ${salt}, ${content}, ${version_timestamp})
      `.run();
    },
    async getComposition({ account, author, channel, recipient, quote, salt }) {
      await setup;
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
      await setup;
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
      await setup;
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
      await setup;
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
  };

  function asSearch(string: string) {
    return string.replace(/[^a-zA-z0-9]/g, "");
  }

  return api;
}
