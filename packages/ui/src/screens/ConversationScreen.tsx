import React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Routes, useRouting } from "../routing";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { useDebounce } from "../components/useDebounce";
import { HorizontalLoader } from "../components/HorizontalLoader";
import { Composition } from "../api";
import { Avatar } from "../components/Avatar";
import { DateTime } from "luxon";

export function ConversationScreen({
  account,
  channel,
  other,
}: Routes["Conversation"]) {
  const api = useApi();
  const theme = useTheme();
  const routing = useRouting();
  const queryClient = useQueryClient();
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const searchTextDebounced = useDebounce(searchText, 300);
  const conversationQuery = useQuery(
    ["conversation", { account, channel, other, searchTextDebounced }],
    async () => {
      return await api.getConversation({
        account,
        channel,
        other,
        content: searchTextDebounced || undefined,
      });
    }
  );
  const contactQuery = useQuery(
    ["contact", { account, author: other }],
    async () => {
      return await api.getContact({ account, author: other });
    }
  );
  const channelQuery = useQuery(["channel", { account, channel }], async () => {
    return await api.getChannel({ account, channel });
  });
  const addCompositionMutation = useMutation(
    async (comunication: Composition) => {
      await api.addComposition(comunication);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["conversation"]);
        setContent("");
      },
    }
  );
  const [content, setContent] = React.useState("");
  const send = () => {
    const version_timestamp = Date.now();
    const salt = String(Math.random());
    addCompositionMutation.mutate({
      author: account,
      channel: channel ?? "",
      recipient: other ?? "",
      quote: "",
      salt,
      content,
      version_timestamp,
    });
  };
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
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Avatar />
              <View style={{ marginLeft: 8 }}>
                <Text
                  style={{
                    color: theme.textColor,
                    fontWeight: "bold",
                  }}
                >
                  {contactQuery.data?.nickname ??
                    channelQuery.data?.nickname ??
                    ""}
                </Text>
                <Text
                  style={{
                    color: theme.textColor,
                  }}
                >
                  {channel || other}
                </Text>
              </View>
            </View>
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
      <HorizontalLoader isLoading={conversationQuery.isFetching} />
      <FlatList
        data={conversationQuery.data}
        renderItem={({
          item: {
            author,
            channel,
            recipient,
            quote,
            salt,
            content,
            version_timestamp,
          },
        }) => {
          const datetime = DateTime.fromMillis(version_timestamp);
          return (
            <Pressable
              onPress={() => {
                routing.push("Composition", {
                  account,
                  author,
                  channel,
                  recipient,
                  quote,
                  salt,
                });
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  alignItems: "flex-start",
                }}
              >
                <Avatar />
                <View style={{ marginHorizontal: 8, flex: 1 }}>
                  <Text
                    style={{
                      color: theme.textColor,
                      fontWeight: "bold",
                      flex: 1,
                    }}
                  >
                    {author}
                  </Text>
                  <Text
                    style={{
                      color: theme.textColor,
                    }}
                  >
                    {content}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: "#7f848e",
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {datetime.toLocaleString(DateTime.TIME_WITH_SECONDS)}
                  </Text>
                  {!datetime.hasSame(DateTime.now(), "day") && (
                    <Text
                      style={{ color: theme.textColor, textAlign: "right" }}
                    >
                      {datetime.toLocaleString(DateTime.DATE_MED)}
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          conversationQuery.isLoading ? null : (
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
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => conversationQuery.refetch()}
          />
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
          <Pressable onPress={send} style={{ padding: 16 }}>
            <FontAwesomeIcon icon={"paper-plane"} color={theme.textColor} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
