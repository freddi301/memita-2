import initSqlJs from "sql.js";
import { Sql } from "../../src/components/sql";

export function createSql(): Sql {
  const db = (async () => {
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });
    const db = new SQL.Database();
    return db;
  })();
  return (strings, ...values) => ({
    async run() {
      const result = (await db).exec(strings.join("?"), values);
      if (!result[0]) return [];
      return result[0].values.map((row) =>
        Object.fromEntries(
          row.map((value, index) => [result[0].columns[index], value])
        )
      ) as any;
    },
    async all() {
      const result = (await db).exec(strings.join("?"), values);
      if (!result[0]) return [];
      return result[0].values.map((row) =>
        Object.fromEntries(
          row.map((value, index) => [result[0].columns[index], value])
        )
      ) as any;
    },
  });
}
