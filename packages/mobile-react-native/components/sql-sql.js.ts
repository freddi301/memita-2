import type {SqlDatabase} from '@memita-2/core';
import initSqlJs from 'sql.js';
import rn_bridge from 'rn-bridge';

export async function createSqlSqljs(): Promise<SqlDatabase> {
  const initSQL = await initSqlJs({
    locateFile: file => `${process.cwd()}/sql.js/dist/${file}`,
  });
  rn_bridge.channel.send({scope: 'log', message: 'sql.js db ready'});
  const db = new initSQL.Database();
  const doIt = async (query: string, values: Array<string | number>) => {
    const result = db.exec(query, values);
    if (!result[0]) {
      return [];
    }
    return result[0].values.map(row =>
      Object.fromEntries(
        row.map((value, index) => [result[0].columns[index], value]),
      ),
    ) as any;
  };
  return {
    async run(query, values) {
      await doIt(query, values);
    },
    async all(query, values) {
      return await doIt(query, values);
    },
    async close() {
      db.close();
    },
  };
}
