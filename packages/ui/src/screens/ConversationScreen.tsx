import React from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { Routes, useRouting } from "../routing";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { CompositionListItem } from "../components/CompositionListItem";
import { useDebounce } from "../components/useDebounce";
import { HorizontalLoader } from "../components/HorizontalLoader";
import { Composition } from "../api";

export function ConversationScreen({
  author,
  recipient,
}: Routes["Conversation"]) {
  const api = useApi();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const searchTextDebounced = useDebounce(searchText, 300);
  const compositionsQuery = useQuery(
    ["compositions", { searchTextDebounced, author, recipient }],
    async () => {
      return api.getCompositions({
        content: searchTextDebounced || undefined,
        author,
        recipient,
      });
    }
  );
  const addCompositionMutation = useMutation(
    async (comunication: Composition) => {
      await api.addComposition(comunication);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["compositions"]);
        setContent("");
      },
    }
  );
  const [content, setContent] = React.useState("");
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
        {isSearching ? (
          <React.Fragment>
            <TextInput
              value={searchText}
              onChangeText={(newText) => {
                setSearchText(newText);
              }}
              placeholder={"🔍"}
              style={{
                color: theme.textColor,
                flex: 1,
                paddingHorizontal: 16,
              }}
              autoFocus
            />
            <Pressable
              onPress={() => {
                setIsSearching(false);
                setSearchText("");
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon icon={"times"} color={theme.textColor} />
            </Pressable>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <BackButton />
            <Text
              style={{
                flex: 1,
                color: theme.textColor,
                fontWeight: "bold",
                borderBottomColor: "gray",
              }}
            >
              Conversation
            </Text>
            <Pressable
              onPress={() => {
                setIsSearching(true);
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon icon={"search"} color={theme.textColor} />
            </Pressable>
          </React.Fragment>
        )}
      </View>
      <HorizontalLoader isLoading={compositionsQuery.isFetching} />
      <FlatList
        data={compositionsQuery.data}
        renderItem={({ item }) => <CompositionListItem {...item} />}
        ListEmptyComponent={
          compositionsQuery.isLoading ? null : (
            <Text
              style={{
                color: theme.textColor,
                textAlign: "center",
                padding: 16,
              }}
            >
              {isSearching ? (
                <React.Fragment>
                  There are no compositions for term{" "}
                  <Text style={{ fontWeight: "bold" }}>{searchText}</Text>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  There are no compositions. Write some!
                </React.Fragment>
              )}
            </Text>
          )
        }
      />
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
          alignItems: "center",
        }}
      >
        <TextInput
          value={content}
          onChangeText={setContent}
          style={{
            flex: 1,
            color: theme.textColor,
            marginLeft: 16,
            paddingVertical: 0,
            marginVertical: 8,
          }}
          multiline
          numberOfLines={content.split("\n").length}
        ></TextInput>
        <View>
          <View style={{ flex: 1 }}></View>
          <Pressable
            onPress={() => {
              const version_timestamp = Date.now();
              const salt = String(Math.random());
              addCompositionMutation.mutate({
                author,
                channel: "",
                recipient,
                quote: "",
                salt,
                content,
                version_timestamp,
              });
            }}
            style={{ padding: 16 }}
          >
            <FontAwesomeIcon icon={"paper-plane"} color={theme.textColor} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
