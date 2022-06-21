import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMutation } from "react-query";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { SimpleInput } from "../components/SimpleInput";

export function AuthotEditScren(props: Routes["AuthorEdit"]) {
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
  const [author, setAuthor] = React.useState(props.author ?? "");
  const [nickname, setNickname] = React.useState(props.nickname ?? "");
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
            color: theme.textColor,
            fontWeight: "bold",
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
      <ScrollView style={{ paddingTop: 8 }}>
        <SimpleInput
          label="Author"
          value={author}
          onChangeText={setAuthor}
          editable={props.author === undefined}
        />
        <SimpleInput
          label="Nickname"
          value={nickname}
          onChangeText={setNickname}
        />
      </ScrollView>
    </View>
  );
}
