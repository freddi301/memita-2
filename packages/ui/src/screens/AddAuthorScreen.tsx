import React from "react";
import { Pressable, Text, View } from "react-native";
import { useMutation, useQueryClient } from "react-query";
import { useRouting } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { SimpleInput } from "../components/SimpleInput";

export function AddAuthorScreen() {
  const routing = useRouting();
  const theme = useTheme();
  const api = useApi();
  const addAuthorMutation = useMutation(
    async ({ author, nickname }: { author: string; nickname: string }) => {
      const version_timestamp = Date.now();
      await api.addAuthor({
        author,
        nickname,
        deleted: false,
        version_timestamp,
      });
    },
    {
      onSuccess() {
        routing.back();
      },
    }
  );
  const [author, setAuthor] = React.useState("");
  const [nickname, setNickname] = React.useState("");
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
            color: theme.textColor,
            fontWeight: "bold",
            paddingVertical: 16,
            borderBottomColor: "gray",
            flex: 1,
          }}
        >
          Add Author
        </Text>
        <Pressable
          onPress={() => {
            addAuthorMutation.mutate({ author, nickname });
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"check"} color={theme.textColor} />
        </Pressable>
      </View>
      <SimpleInput label="Author" value={author} onChangeText={setAuthor} />
      <SimpleInput
        label="Nickname"
        value={nickname}
        onChangeText={setNickname}
      />
    </View>
  );
}
