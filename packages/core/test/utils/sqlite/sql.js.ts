import initSqlJs from "sql.js";
import { Sql } from "../../../src/components/sql";

export function createSql(): Sql {
  const db = (async () => {
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });
    const db = new SQL.Database();
    return db;
  })();
  const sql = (strings: TemplateStringsArray, ...values: any[]) => {
    const doIt = async () => {
      const result = (await db).exec(strings.join("?"), values);
      if (!result[0]) return [];
      return result[0].values.map((row) =>
        Object.fromEntries(
          row.map((value, index) => [result[0].columns[index], value])
        )
      ) as any;
    };
    return {
      run: doIt,
      all: doIt,
    };
  };
  sql.close = async () => {
    (await db).close();
  };
  return sql;
}
