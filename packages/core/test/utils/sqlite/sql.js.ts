import initSqlJs from "sql.js";
import { SqlDatabase } from "../../../src/components/TablesDataGateway";

export function createSqlDatabaseSqlJs(): SqlDatabase {
  const db = (async () => {
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });
    const db = new SQL.Database();
    return db;
  })();
  const doIt = async (query: string, values: Array<string | number>) => {
    const result = (await db).exec(query, values);
    if (!result[0]) return [];
    return result[0].values.map((row) => Object.fromEntries(row.map((value, index) => [result[0].columns[index], value]))) as any;
  };
  return {
    async run(query, values) {
      await doIt(query, values);
    },
    async all(query, values) {
      return await doIt(query, values);
    },
    async close() {
      (await db).close();
    },
  };
}
