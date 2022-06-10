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
import {
  Button,
  FlatList,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import nodejs from 'nodejs-mobile-react-native';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const textStyle = {
    color: isDarkMode ? Colors.white : Colors.black,
  };

  const [text, setText] = React.useState('');

  React.useEffect(() => {
    nodejs.start('main.js');
    nodejs.channel.addListener('message', msg => {
      setText(msg);
    });
  }, []);

  return (
    <SafeAreaView style={{...backgroundStyle, flex: 1}}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View
        style={{
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
        }}>
        <TextInput
          style={textStyle}
          value={text}
          onChangeText={newText => {
            setText(newText);
          }}
        />
        <Button
          onPress={() => {
            nodejs.channel.send('A message!');
          }}
          title="add"
        />
        <FlatList
          data={['a', 'b', 'c']}
          renderItem={({item}) => <Text style={textStyle}>{item}</Text>}
        />
      </View>
    </SafeAreaView>
  );
}
