import type {Sql} from '@memita-2/core';
import initSqlJs from 'sql.js';
import rn_bridge from 'rn-bridge';

export async function createSql() {
  const SQL = await initSqlJs({
    locateFile: file => `./nodejs-project/sql.js/dist/${file}`,
  });
  rn_bridge.channel.send({log: 'db ready'});
  const db = new SQL.Database();
  const sql: Sql = async (strings, ...values) => {
    const result = db.exec(strings.join('?'), values);
    if (!result[0]) {
      return [];
    }
    return result[0].values.map(row =>
      Object.fromEntries(
        row.map((value, index) => [result[0].columns[index], value]),
      ),
    ) as any;
  };
  return sql;
}
