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
import {Overrides} from '@memita-2/ui';
import QRCodeScanner from 'react-native-qrcode-scanner';
const QRCodeScannerAny = QRCodeScanner as any;

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
  return <Ui api={api} overrides={overrides} />;
}

const overrides: Overrides = {
  copyToClipboard(text) {
    console.warn('copy to clipboard', text);
  },
  QrCodeScanner({onData}) {
    return <QRCodeScannerAny onRead={(e: any) => onData(e.data)} />;
  },
};
