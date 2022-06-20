import sqlite3 from "sqlite3";
import { Sql } from "../src";

export function createSql() {
  const db = sqlite3.cached.Database(":memory:");
  sqlite3.verbose();
  const sql: Sql = (strings, ...values) =>
    new Promise((resolve, reject) => {
      db.all(strings.join("?"), values, (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows as any);
        }
      });
    });
  return sql;
}
