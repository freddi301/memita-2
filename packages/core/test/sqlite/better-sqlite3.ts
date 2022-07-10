import Database from "better-sqlite3";
import { Sql } from "../../src/components/sql";

export function createSql(): Sql {
  const db = new Database(":memory:");
  const sql = (strings: TemplateStringsArray, ...values: any[]) => ({
    async run() {
      db.prepare(strings.join("?")).run(values);
    },
    async all() {
      return db.prepare(strings.join("?")).all(values);
    },
  });
  sql.close = async () => {
    db.close();
  };
  return sql;
}
