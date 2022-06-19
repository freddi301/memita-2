import React from "react";
import {
  Button,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { BackButton } from "../components/BackButton";
import { useRouting } from "../routing";
import { useTheme } from "../theme";
import { ApiContext } from "../ui";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { SimpleInput } from "../components/SimpleInput";

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
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColorPrimary }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
        }}
      >
        <BackButton />
        <Text
          style={{
            flex: 1,
            color: theme.textColor,
            fontWeight: "bold",
            paddingVertical: "16px",
            borderBottomColor: "gray",
          }}
        >
          Blocks
        </Text>
        <Pressable
          onPress={() => {
            blockMutation.mutate(text);
          }}
          style={{ padding: "16px" }}
        >
          <FontAwesomeIcon icon={"plus"} color={theme.textColor} />
        </Pressable>
      </View>
      <SimpleInput
        label="block"
        value={text}
        onChangeText={setText}
        multiline
      />
      <FlatList
        data={blocksQuery.data}
        style={{ backgroundColor: theme.backgroundColorSecondary }}
        renderItem={({ item }) => (
          <Text
            style={{
              padding: "16px",
              color: theme.textColor,
              backgroundColor: theme.backgroundColorPrimary,
              margin: "8px",
              borderRadius: 8,
              fontFamily: "monospace",
            }}
          >
            {item}
          </Text>
        )}
      />
    </View>
  );
}
