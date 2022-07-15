import type {Sql} from '@memita-2/core';
import initSqlJs from 'sql.js';
import rn_bridge from 'rn-bridge';

export function createSqlSqljs(): Sql {
  const initSQL = initSqlJs({
    locateFile: file => `${process.cwd()}/sql.js/dist/${file}`,
  });
  initSQL.then(() => {
    rn_bridge.channel.send({scope: 'log', message: 'sql.js db ready'});
  });
  const db = initSQL.then(SQL => new SQL.Database());
  const sql = (strings: TemplateStringsArray, ...values: any[]) => {
    const doIt = async () => {
      const result = (await db).exec(strings.join('?'), values);
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
      run: doIt,
      all: doIt,
      text() {
        return strings.join('');
      },
    };
  };
  sql.close = async () => {
    (await db).close();
  };
  return sql;
}
