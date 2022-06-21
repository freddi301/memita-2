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
import {FlatList, Text, View} from 'react-native';

const SHOW_NODEJS_MESSAGES = true;

export default function App() {
  const [messages, setMessages] = React.useState<Array<string>>([]);
  React.useEffect(() => {
    nodejs.start('main.js');
    if (SHOW_NODEJS_MESSAGES) {
      nodejs.channel.addListener('message', msg => {
        setMessages(messages => [JSON.stringify(msg, null, 2), ...messages]);
      });
    }
  }, []);
  const api = React.useMemo(() => {
    return new Proxy(
      {},
      {
        get(target, method) {
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
  if (SHOW_NODEJS_MESSAGES) {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1}}>
          <FlatList
            data={messages}
            renderItem={({item}) => <Text>{item}</Text>}
          />
        </View>
        <View style={{flex: 1}}>
          <Ui api={api} />
        </View>
      </View>
    );
  }
  return <Ui api={api} />;
}
