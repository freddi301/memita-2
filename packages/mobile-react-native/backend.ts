import rn_bridge from 'rn-bridge';
import {createApi} from '@memita-2/core';
import {createSql} from './components/sql';
import path from 'path';
import os from 'os';

rn_bridge.channel.send({log: 'nodejs ready'});

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

const api = createApi(createSql());

rn_bridge.channel.on('message', ({requestId, method, args}: any) => {
  (api as any)[method](...args).then(
    (result: any) => {
      rn_bridge.channel.send({requestId, isError: false, result});
    },
    (result: any) => {
      rn_bridge.channel.send({requestId, isError: true, result});
    },
  );
});
