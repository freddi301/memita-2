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
import {Api, Ui} from '@memita-2/ui';

export default function App() {
  React.useEffect(() => {
    nodejs.start('main.js');
  }, []);
  const api = React.useMemo(() => {
    return new Proxy(
      {},
      {
        get(target, method, receiver) {
          return (...args: any[]) =>
            new Promise((resolve, reject) => {
              const requestId = Math.random();
              const listener = (msg: any) => {
                if (msg.requestId === requestId) {
                  if (!msg.isError) resolve(msg.result);
                  else reject(msg.result);
                  nodejs.channel.removeListener('message', listener);
                }
              };
              nodejs.channel.addListener('message', listener);
              nodejs.channel.send({requestId, method, args});
            });
        },
      },
    ) as Api;
  }, []);
  return <Ui api={api} />;
}
