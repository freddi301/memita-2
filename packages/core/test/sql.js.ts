import initSqlJs from "sql.js";
import { Sql } from "../src";

export async function createSql() {
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });
  const db = new SQL.Database();
  const sql: Sql = async (strings, ...values) => {
    const result = db.exec(strings.join("?"), values);
    if (!result[0]) return [];
    return result[0].values.map((row) =>
      Object.fromEntries(
        row.map((value, index) => [result[0].columns[index], value])
      )
    ) as any;
  };
  return sql;
}
