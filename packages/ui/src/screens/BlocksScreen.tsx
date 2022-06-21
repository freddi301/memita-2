import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { BackButton } from "../components/BackButton";
import { useRouting } from "../routing";
import { useTheme } from "../theme";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { SimpleInput } from "../components/SimpleInput";
import { useApi } from "../ui";

export function BlocksScreen() {
  const [text, setText] = React.useState("");
  const api = useApi();
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
          height: theme.headerHeight,
          alignItems: "center",
        }}
      >
        <BackButton />
        <Text
          style={{
            flex: 1,
            color: theme.textColor,
            fontWeight: "bold",
            paddingVertical: 16,
            borderBottomColor: "gray",
          }}
        >
          Blocks
        </Text>
        <Pressable
          onPress={() => {
            blockMutation.mutate(text);
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"plus"} color={theme.textColor} />
        </Pressable>
      </View>
      <SimpleInput label="block" value={text} onChangeText={setText} />
      <FlatList
        data={blocksQuery.data}
        style={{ backgroundColor: theme.backgroundColorSecondary }}
        renderItem={({ item }) => (
          <Text
            style={{
              padding: 16,
              color: theme.textColor,
              backgroundColor: theme.backgroundColorPrimary,
              margin: 8,
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
