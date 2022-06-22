import { Sql } from "@memita-2/core";
import Database from "better-sqlite3";

export function createSql(): Sql {
  const db = new Database(":memory:");
  return (strings, ...values) => ({
    async run() {
      db.prepare(strings.join("?")).run(values);
    },
    async all() {
      return db.prepare(strings.join("?")).all(values);
    },
  });
}
