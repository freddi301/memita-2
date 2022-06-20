import { Sql } from "@memita-2/core/dist/sql";
import sqlite3 from "sqlite3";

const db = sqlite3.cached.Database(":memory:");
sqlite3.verbose();

export const sql: Sql = (strings, values) =>
  new Promise((resolve, reject) => {
    db.all(strings.join("?"), values, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows as any);
      }
    });
  });
sql.serialize = (callback) => {
  db.serialize(callback);
};
