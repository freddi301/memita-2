import type {Sql} from '@memita-2/core';
import initSqlJs from 'sql.js';
import rn_bridge from 'rn-bridge';

export function createSql(): Sql {
  const initSQL = initSqlJs({
    locateFile: file => `${process.cwd()}/sql.js/dist/${file}`,
  });
  initSQL.then(() => {
    rn_bridge.channel.send({log: 'db ready'});
  });
  const db = initSQL.then(SQL => new SQL.Database());
  const sql = (strings: TemplateStringsArray, ...values: any[]) => ({
    async run() {
      const result = (await db).exec(strings.join('?'), values);
      if (!result[0]) {
        return [];
      }
      return result[0].values.map(row =>
        Object.fromEntries(
          row.map((value, index) => [result[0].columns[index], value]),
        ),
      ) as any;
    },
    async all() {
      const result = (await db).exec(strings.join('?'), values);
      if (!result[0]) {
        return [];
      }
      return result[0].values.map(row =>
        Object.fromEntries(
          row.map((value, index) => [result[0].columns[index], value]),
        ),
      ) as any;
    },
  });
  sql.close = async () => {
    (await db).close();
  };
  return sql;
}
