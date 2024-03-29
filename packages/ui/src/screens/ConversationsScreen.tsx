import React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQuery } from "react-query";
import { Routes, useRouting } from "../routing";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { useDebounce } from "../components/useDebounce";
import { HorizontalLoader } from "../components/HorizontalLoader";
import { Avatar } from "../components/Avatar";
import { DateTime } from "luxon";
import { I18n } from "../components/I18n";
import { formatAuthor } from "../components/format";

export function ConversationsScreen({ account }: Routes["Conversations"]) {
  const api = useApi();
  const routing = useRouting();
  const theme = useTheme();
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const searchTextDebounced = useDebounce(searchText, 300);
  const conversationsQuery = useQuery(
    ["conversations", { account }],
    async () => {
      return await api.getPrivateConversations({ account });
    }
  );
  const accountQuery = useQuery(["account", { account }], async () => {
    return await api.getAccount({ account });
  });
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColorPrimary }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
          height: theme.headerHeight,
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
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
              <FontAwesomeIcon icon={"times"} color={theme.actionTextColor} />
            </Pressable>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <BackButton />
            <Avatar />
            <View
              style={{
                flexDirection: "column",
                paddingHorizontal: 16,
                flex: 1,
              }}
            >
              <Text style={{ color: theme.textColor, fontWeight: "bold" }}>
                {accountQuery.data?.nickname ?? ""}
              </Text>
              <Text style={{ color: theme.textColor }}>
                {formatAuthor(account)}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setIsSearching(true);
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon icon={"search"} color={theme.actionTextColor} />
            </Pressable>
          </React.Fragment>
        )}
      </View>
      <FlatList
        data={conversationsQuery.data}
        renderItem={({ item }) => {
          const datetime = DateTime.fromMillis(
            item.lastMessage.version_timestamp
          );
          const other =
            item.lastMessage.author === account
              ? item.contact.account
              : item.lastMessage.author;
          return (
            <Pressable
              onPress={() => {
                routing.push("Conversation", { account, other });
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: "row",
              }}
            >
              <Avatar />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      color: theme.textColor,
                      fontWeight: "bold",
                      flex: 1,
                    }}
                  >
                    {item.contact.nickname}
                  </Text>
                  <Text
                    style={{
                      color: theme.textSecondaryColor,
                    }}
                  >
                    {!datetime.hasSame(DateTime.now(), "day") &&
                      datetime.toLocaleString(DateTime.DATE_MED)}
                    {"  "}
                    {datetime.toLocaleString(DateTime.TIME_WITH_SECONDS)}
                  </Text>
                </View>
                <Text
                  style={{
                    color: theme.textColor,
                    height: 20,
                    overflow: "hidden",
                  }}
                >
                  {item.lastMessage.content}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          conversationsQuery.isLoading ? null : (
            <Text
              style={{
                color: theme.textColor,
                textAlign: "center",
                padding: 16,
              }}
            >
              {isSearching ? (
                <React.Fragment>
                  <I18n
                    en="There are no messages for term"
                    it="Non ci sono messaggi per il termine"
                  />{" "}
                  <Text style={{ fontWeight: "bold" }}>{searchText}</Text>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <I18n
                    en="There are no messages. Write some!"
                    it="Non ci sono messagi. Scrivine uno!"
                  />
                </React.Fragment>
              )}
            </Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => conversationsQuery.refetch()}
          />
        }
        ListHeaderComponent={() => (
          <HorizontalLoader isLoading={conversationsQuery.isFetching} />
        )}
      />
    </View>
  );
}
