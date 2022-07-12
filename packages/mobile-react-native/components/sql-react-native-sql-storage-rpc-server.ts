import SQLite from 'react-native-sqlite-storage';
import nodejs from 'nodejs-mobile-react-native';

SQLite.enablePromise(true);
export function createSqlReactNativeSqlStorageRpcServer() {
  SQLite.openDatabase({name: 'my.db', location: 'default'}).then((db: any) => {
    // db.executeSql('DROP TABLE accounts');
    console.log({
      scope: 'log',
      message: 'react-native-sqlite-storage db ready',
    });
    nodejs.channel.addListener('message', message => {
      if (message.scope === 'sql') {
        db.executeSql(message.query, message.parameters).then(
          (result: any) => {
            nodejs.channel.send({
              scope: 'sql',
              id: message.id,
              isError: false,
              result: result[0].rows.raw(),
            });
          },
          (error: any) => {
            nodejs.channel.send({
              scope: 'sql',
              id: message.id,
              isError: true,
              result: error,
            });
          },
        );
      }
    });
  });
}
