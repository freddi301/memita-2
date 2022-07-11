/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import nodejs from 'nodejs-mobile-react-native';
import {Ui} from '@memita-2/ui';
import {createApiRpcClient} from './components/api-rpc-client';
import {createSqlReactNativeSqlStorageRpcServer} from './components/sql-react-native-sql-storage-rpc-server';

export default function App() {
  React.useEffect(() => {
    nodejs.start('main.js');
    createSqlReactNativeSqlStorageRpcServer();
    nodejs.channel.addListener('message', message => {
      if (message.scope === 'log') console.log(message);
    });
  }, []);
  const api = React.useMemo(() => {
    return createApiRpcClient();
  }, []);
  return <Ui api={api} />;
}
