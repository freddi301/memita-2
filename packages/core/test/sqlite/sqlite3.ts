import sqlite3 from "sqlite3";
import { Sql } from "../../src";

export function createSql(): Sql {
  const db = sqlite3.cached.Database(":memory:");
  sqlite3.verbose();
  return (strings, ...values) => ({
    async run() {
      return new Promise((resolve, reject) => {
        db.all(strings.join("?"), values, (error, rows) => {
          if (error) {
            reject(error);
          } else {
            resolve(rows as any);
          }
        });
      });
    },
    async all() {
      return new Promise((resolve, reject) => {
        db.all(strings.join("?"), values, (error, rows) => {
          if (error) {
            reject(error);
          } else {
            resolve(rows as any);
          }
        });
      });
    },
  });
}
