import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { Avatar } from "../components/Avatar";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useMutation, useQuery } from "react-query";
import { useApi } from "../ui";
import { CompositionListItem } from "../components/CompositionListItem";

export function AuthorScreen({ author, nickname }: Routes["Author"]) {
  const theme = useTheme();
  const routing = useRouting();
  const api = useApi();
  const deleteAuthorMutation = useMutation(
    async (author: string) => {
      const version_timestamp = Date.now();
      await api.addAuthor({
        author,
        nickname,
        deleted: true,
        version_timestamp,
      });
    },
    {
      onSuccess() {
        routing.back();
      },
    }
  );
  const compositionsQuery = useQuery(["compositions", { author }], async () => {
    return api.getCompositions({ author });
  });
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColorPrimary }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
          alignItems: "center",
        }}
      >
        <BackButton />
        <Avatar />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text
            style={{
              color: theme.textColor,
              fontWeight: "bold",
            }}
          >
            {nickname}
          </Text>
          <Text
            style={{
              color: theme.textColor,
            }}
          >
            {author}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            deleteAuthorMutation.mutate(author);
          }}
          style={{ padding: "16px" }}
        >
          <FontAwesomeIcon icon={"trash"} color={theme.textColor} />
        </Pressable>
      </View>
      <FlatList
        data={compositionsQuery.data}
        renderItem={({ item }) => <CompositionListItem {...item} />}
      />
    </View>
  );
}
