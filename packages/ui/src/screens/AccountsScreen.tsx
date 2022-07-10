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
import { useRouting } from "../routing";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTheme } from "../theme";
import { Avatar } from "../components/Avatar";
import { useApi } from "../ui";
import { useDebounce } from "../components/useDebounce";
import { HorizontalLoader } from "../components/HorizontalLoader";
import { I18n } from "../components/I18n";

export function AccountsScreen() {
  const api = useApi();
  const routing = useRouting();
  const theme = useTheme();
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const searchTextDebounced = useDebounce(searchText, 300);
  const accountsQuery = useQuery(
    ["accounts", { searchTextDebounced }],
    async () => {
      return await api.getAccounts({
        nickname: searchTextDebounced || undefined,
      });
    }
  );
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
              placeholder={"🔍"}
              onChangeText={(newText) => {
                setSearchText(newText);
              }}
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
            <Text
              style={{
                flex: 1,
                color: theme.textColor,
                fontWeight: "bold",
                marginLeft: 48,
              }}
            >
              <I18n en="Your Accounts" it="I tuoi account" />
            </Text>
            <Pressable
              onPress={() => {
                setIsSearching(true);
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon icon={"search"} color={theme.actionTextColor} />
            </Pressable>
            <Pressable
              onPress={() => {
                routing.push("Account", {});
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon icon={"plus"} color={theme.actionTextColor} />
            </Pressable>
          </React.Fragment>
        )}
      </View>
      <FlatList
        data={accountsQuery.data}
        renderItem={({ item: { author, nickname } }) => (
          <Pressable
            onPress={() => {
              routing.push("Navigation", { account: author });
            }}
          >
            <View
              style={{
                flexDirection: "row",
                paddingVertical: 8,
                paddingHorizontal: 16,
                alignItems: "center",
              }}
            >
              <Avatar />
              <View style={{ marginLeft: 16 }}>
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
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          accountsQuery.isLoading ? null : (
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
                    en="There are no Accounts for term"
                    it="Non ci sono account per il termine"
                  />{" "}
                  <Text style={{ fontWeight: "bold" }}>{searchText}</Text>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <I18n
                    en="There are no Accounts. Add some!"
                    it="Non ci sono account. Aggiungine qualcuno!"
                  />
                </React.Fragment>
              )}
            </Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => accountsQuery.refetch()}
          />
        }
        ListHeaderComponent={() => (
          <HorizontalLoader isLoading={accountsQuery.isFetching} />
        )}
      />
    </View>
  );
}
