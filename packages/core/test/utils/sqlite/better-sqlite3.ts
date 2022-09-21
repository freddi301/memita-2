import Database from "better-sqlite3";
import { SqlDatabase } from "../../../src/components/TablesDataGateway";

export function createSqlDatabaseBetterSqlite3(): SqlDatabase {
  const db = new Database(":memory:");
  return {
    async run(query, values) {
      db.prepare(query).run(values);
    },
    async all(query, values) {
      return db.prepare(query).all(values);
    },
    async close() {
      db.close();
    },
  };
}
