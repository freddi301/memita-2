import sqlite3 from "sqlite3";
import { SqlDatabase } from "../../../src/components/TablesDataGateway";

export function createSqlDatabaseSqlite3(): SqlDatabase {
  const db = sqlite3.cached.Database(":memory:");
  sqlite3.verbose();
  return {
    run(query, values) {
      return new Promise((resolve, reject) => db.run(query, values, (error) => (error ? reject(error) : resolve())));
    },
    all(query, values) {
      return new Promise((resolve, reject) => db.all(query, values, (error, rows) => (error ? reject(error) : resolve(rows))));
    },
    close() {
      return new Promise<void>((resolve, reject) => db.close((error) => (error ? reject(error) : resolve(undefined))));
    },
  };
}
