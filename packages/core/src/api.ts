import type { Api } from "@memita-2/ui";
import Hyperswarm from "hyperswarm";
import { Sql } from "./sql";

export function createApi(sql: Sql) {
  const api: Api = {
    async getBlocks() {
      return Array.from(blocks);
    },
    async addBlock(text) {
      if (blocks.has(text)) return;
      blocks.add(text);
      for (const listener of listeners) {
        listener(text);
      }
    },
    async getAuthors({ nickname = "DONTFILTER", label = "DONTFILTER" }) {
      await dbSetupDone;
      const nicknameSearch = "%" + asSearch(nickname) + "%";
      return (await sql`
          SELECT author, nickname, label, MAX(version_timestamp) AS version_timestamp FROM authors
          GROUP BY author
          HAVING
            (nickname LIKE CASE WHEN ${nickname} = 'DONTFILTER' THEN nickname ELSE ${nicknameSearch} END) AND
            (label = CASE WHEN ${label} = 'DONTFILTER' THEN label ELSE ${label} END)
          ORDER BY nickname ASC
        `.all()) as any;
    },
    async addAuthor({ author, nickname, label, version_timestamp }) {
      await dbSetupDone;
      await sql`
        INSERT INTO authors (author, nickname, label, version_timestamp)
        VALUES (${author}, ${nickname}, ${label}, ${version_timestamp})
      `.run();
    },
    async getCompositions({
      author = "DONTFILTER",
      channel = "DONTFILTER",
      recipient = "DONTFILTER",
      quote = "DONTFILTER",
      content = "DONTFILTER",
    }) {
      await dbSetupDone;
      const contentSearch = "%" + asSearch(content) + "%";
      return (await sql`
        SELECT author, channel, recipient, quote, salt, content, MAX(version_timestamp) AS version_timestamp, COUNT(version_timestamp) AS versions FROM compositions
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
    async addComposition({
      author,
      channel,
      recipient,
      quote,
      salt,
      content,
      version_timestamp,
    }) {
      await dbSetupDone;
      await sql`
        INSERT INTO compositions (author, channel, recipient, quote, salt, content, version_timestamp)
        VALUES (${author}, ${channel}, ${recipient}, ${quote}, ${salt}, ${content}, ${version_timestamp})
      `.run();
    },
    async getConversation({
      author = "DONTFILTER",
      channel = "DONTFILTER",
      recipient = "DONTFILTER",
      quote = "DONTFILTER",
      content = "DONTFILTER",
    }) {
      await dbSetupDone;
      const contentSearch = "%" + asSearch(content) + "%";
      return (await sql`
        SELECT author, channel, recipient, quote, salt, content, MAX(version_timestamp) AS version_timestamp, COUNT(version_timestamp) AS versions FROM compositions
        WHERE
          (
            (
              (author = CASE WHEN ${author} = 'DONTFILTER' THEN author ELSE ${author} END) AND
              (recipient = CASE WHEN ${recipient} = 'DONTFILTER' THEN recipient ELSE ${recipient} END)
            ) OR
            (
              (recipient = CASE WHEN ${author} = 'DONTFILTER' THEN recipient ELSE ${author} END) AND
              (author = CASE WHEN ${recipient} = 'DONTFILTER' THEN author ELSE ${recipient} END)
            )
          ) AND
          (channel = CASE WHEN ${channel} = 'DONTFILTER' THEN channel ELSE ${channel} END) AND
          (quote = CASE WHEN ${quote} = 'DONTFILTER' THEN quote ELSE ${quote} END)
        GROUP BY author, channel, recipient, quote, salt
        HAVING
          (content LIKE CASE WHEN ${content} = 'DONTFILTER' THEN content ELSE ${contentSearch} END)
        ORDER BY MAX(version_timestamp) ASC
      `.all()) as any;
    },
  };

  function asSearch(string: string) {
    return string.replace(/[^a-zA-z0-9]/g, "");
  }

  const blocks = new Set<string>();

  type Listener = (block: string) => void;

  const listeners = new Set<Listener>();

  function subscribe(listener: Listener) {
    for (const block of blocks) {
      listener(block);
    }
    listeners.add(listener);
  }

  function unsubscribe(listener: Listener) {
    listeners.delete(listener);
  }

  function replicate() {
    const topic = Buffer.alloc(32).fill("memita-2");
    const swarm = new Hyperswarm();
    swarm.join(topic, { server: true, client: true });
    swarm.on("connection", (connection, info) => {
      connection.on("data", (data) => {
        api.addBlock(String(data));
      });
      const listener: Listener = (block) => {
        connection.write(block);
      };
      subscribe(listener);
      connection.on("close", () => {
        unsubscribe(listener);
      });
      connection.on("error", () => {
        unsubscribe(listener);
      });
    });
  }

  const dbSetupDone = Promise.all([
    optimizeDd(),

    sql`CREATE TABLE authors (
      author TEXT NOT NULL,
      nickname TEXT NOT NULL,
      label TEXT NOT NULL,
      version_timestamp INT NOT NUll,
      PRIMARY KEY (author, nickname, label, version_timestamp)
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

  return api;
}
