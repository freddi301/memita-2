import React from "react";
import { Button, FlatList, Text, TextInput, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useRouting } from "../routing";
import { ApiContext } from "../ui";

export function BlocksScreen() {
  const [text, setText] = React.useState("");
  const api = React.useContext(ApiContext);
  const queryClient = useQueryClient();
  const blockMutation = useMutation(
    async (block: string) => {
      await api.addBlock(block);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries("blocks");
        setText("");
      },
    }
  );
  const blocksQuery = useQuery(["blocks"], async () => {
    return api.getBlocks();
  });
  const routing = useRouting();
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Button
        onPress={() => {
          routing.back();
        }}
        title="Back"
      />

      <TextInput
        value={text}
        onChangeText={(newText) => {
          setText(newText);
        }}
      />
      <Button
        onPress={() => {
          blockMutation.mutate(text);
        }}
        title="add"
      />
      <FlatList
        data={blocksQuery.data}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
    </View>
  );
}
