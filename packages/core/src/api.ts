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
    async getProfiles({ searchText }) {
      if (searchText) {
        return await sql`
          SELECT * 
          FROM profile_search 
          WHERE profile_search = ${searchText.replace(/[^a-zA-Z]/g, "") + "*"}
          ORDER BY rank
        `;
      }
      return await sql`SELECT * FROM profile`;
    },
    async addProfile(id: string) {
      sql.serialize(async () => {
        sql`BEGIN`;
        sql`INSERT INTO profile VALUES (${id})`;
        sql`INSERT INTO profile_search VALUES (${id})`;
        sql`COMMIT`;
      });
    },
    async deleteProfile(id: string) {
      sql.serialize(async () => {
        sql`BEGIN`;
        sql`DELETE from profile WHERE id = (${id})`;
        sql`DELETE from profile_search WHERE id = (${id})`;
        sql`COMMIT`;
      });
    },
    async getCompositions({ author, channel, recipient, thread, searchText }) {
      await dbSetupDone;
      return await sql`
        SELECT author, channel, recipient, thread, salt, Max(timestamp) AS timestamp, text, Count(timestamp) AS versions FROM comunication
        GROUP BY author, channel, recipient, thread, salt
        ORDER BY MAX(timestamp) DESC
      `;
    },
    // TODO
    // WHERE author=${author} AND channel=${channel} AND recipient=${recipient} AND thread=${thread}
    async addComposition(params) {
      await dbSetupDone;
      const { author, channel, recipient, thread, salt, timestamp, text } =
        params;
      await sql`
        INSERT INTO comunication (author, channel, recipient, thread, salt, timestamp, text)
        VALUES (${author}, ${channel}, ${recipient}, ${thread}, ${salt}, ${timestamp}, ${text})
      `;
    },
  };

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
    sql`CREATE TABLE profile (id TEXT PRIMARY KEY)`,
    sql`CREATE VIRTUAL TABLE profile_search USING FTS5(id)`,

    sql`CREATE TABLE comunication (
      author TEXT NOT NULL,
      channel TEXT,
      recipient TEXT,
      thread TEXT,
      salt TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      text TEXT,
      PRIMARY KEY (author, channel, recipient, thread, salt, timestamp, text)
    )`,
  ]);

  return api;
}
