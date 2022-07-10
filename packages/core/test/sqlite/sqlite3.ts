import sqlite3 from "sqlite3";
import { Sql } from "../../src/components/sql";

export function createSql(): Sql {
  const db = sqlite3.cached.Database(":memory:");
  sqlite3.verbose();
  const sql = (strings: TemplateStringsArray, ...values: any[]) => ({
    run() {
      return new Promise<void>((resolve, reject) => {
        db.all(strings.join("?"), values, (error, rows) => {
          if (error) {
            reject(error);
          } else {
            resolve(rows as any);
          }
        });
      });
    },
    all() {
      return new Promise<Array<any>>((resolve, reject) => {
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
  sql.close = () => {
    return new Promise<void>((resolve, reject) =>
      db.close((error) => (error ? reject(error) : resolve(undefined)))
    );
  };
  return sql;
}
