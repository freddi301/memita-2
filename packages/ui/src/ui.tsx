import React from "react"
import {
  Button,
  FlatList,
  Text,
  TextInput,
  View,
} from 'react-native';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "react-query";
import { Api } from "./api";

const queryClient = new QueryClient();

const ApiContext = React.createContext<Api>(null as any)

type UiProps = {
  api: Api
}
export function Ui({ api }: UiProps) {
  return <ApiContext.Provider value={api}>
    <QueryClientProvider client={queryClient}>
      <Blocks />
    </QueryClientProvider>
  </ApiContext.Provider>
}

function Blocks() {
  const [text, setText] = React.useState('');
  const api = React.useContext(ApiContext)
  const blockMutation = useMutation(async (block: string) => {
    await api.addBlock(block)
  }, {
    onSuccess() {
      queryClient.invalidateQueries("blocks");
      setText("");
    },
  });
  const blocksQuery = useQuery(["blocks"], async () => {
    return api.getBlocks()
  });
  return (
    <View
      style={{
        flex: 1
      }}>
      <TextInput
        value={text}
        onChangeText={newText => {
          setText(newText);
        }}
      />
      <Button
        onPress={() => {
          blockMutation.mutate(text)
        }}
        title="add"
      />
      <FlatList
        data={blocksQuery.data}
        renderItem={({ item }) => <Text >{item}</Text>}
      />
    </View>
  );
}