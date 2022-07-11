import rn_bridge from 'rn-bridge';
import {createApi} from '@memita-2/core';
import path from 'path';
import os from 'os';
import {createApiRpcServer} from './components/api-rpc-server.js';
import {createSqlSqljs} from './components/sql-sql.js.js';
import {createSqlReactNativeSqlStorageRpcClient} from './components/slq-react-native-sql-storage-rpc-client.js';

rn_bridge.channel.send({scope: 'log', message: 'nodejs ready'});

// Set default directories
process.env = process.env || {};
const appDataDir = (process.env.APP_DATA_DIR = rn_bridge.app.datadir());
const nodejsProjectDir = path.resolve(appDataDir, 'nodejs-project');
os.homedir = () => nodejsProjectDir;
process.cwd = () => nodejsProjectDir;

// Report JS backend crashes to Java, and in turn, to ACRA
process.on('unhandledRejection', reason => {
  console.error(reason);
  rn_bridge.channel.post('exception', reason);
  setTimeout(() => {
    process.exit(1);
  });
});
process.on('uncaughtException', (err: Error | string) => {
  console.error(err);
  if (typeof err === 'string') {
    rn_bridge.channel.post('exception', err);
  } else {
    rn_bridge.channel.post('exception', err.message + '\n' + err.stack);
  }
  setTimeout(() => {
    process.exit(1);
  });
});

const sql = createSql('react-native-sql-storage');
const api = createApi(sql);
createApiRpcServer(api);

function createSql(type: 'sql.js' | 'react-native-sql-storage') {
  switch (type) {
    case 'sql.js':
      return createSqlSqljs();
    case 'react-native-sql-storage':
      return createSqlReactNativeSqlStorageRpcClient();
  }
}
