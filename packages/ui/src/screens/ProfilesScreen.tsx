import React from "react";
import { Button, FlatList, Text, TextInput, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useRouting } from "../routing";
import { ApiContext } from "../ui";

export function ProfilesScreen() {
  const [text, setText] = React.useState("");
  const api = React.useContext(ApiContext);
  const queryClient = useQueryClient();
  const profilesMutation = useMutation(
    async (id: string) => {
      await api.addProfile(id);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries("profiles");
        setText("");
      },
    }
  );
  const blocksQuery = useQuery(["profiles"], async () => {
    return api.getProfiles();
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
          profilesMutation.mutate(text);
        }}
        title="add"
      />
      <FlatList
        data={blocksQuery.data}
        renderItem={({ item }) => <Text>{item.id}</Text>}
      />
    </View>
  );
}
