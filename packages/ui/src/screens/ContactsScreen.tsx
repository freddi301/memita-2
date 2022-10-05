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
import { Avatar } from "../components/Avatar";
import { useApi } from "../ui";
import { useDebounce } from "../components/useDebounce";
import { HorizontalLoader } from "../components/HorizontalLoader";
import { I18n } from "../components/I18n";
import { formatAuthor } from "../components/format";

export function ContactsScreen({ account }: Routes["Contacts"]) {
  const api = useApi();
  const routing = useRouting();
  const theme = useTheme();
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const searchTextDebounced = useDebounce(searchText, 300);
  const contactsQuery = useQuery(["contacts", { account }], async () => {
    return await api.getContacts({ account });
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
            <BackButton />
            <Text
              style={{
                flex: 1,
                color: theme.textColor,
                fontWeight: "bold",
              }}
            >
              <I18n en="Contacts" it="Contatti" />
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
                routing.push("Contact", { account });
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon icon={"plus"} color={theme.actionTextColor} />
            </Pressable>
          </React.Fragment>
        )}
      </View>
      <FlatList
        data={contactsQuery.data}
        renderItem={({ item: { account, contact, nickname } }) => (
          <Pressable
            onPress={() => {
              routing.push("Profile", { account, author: contact });
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
              <View style={{ marginLeft: 8 }}>
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
                  {formatAuthor(contact)}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          contactsQuery.isLoading ? null : (
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
                    en="There are no contacts for term"
                    it="Non ci sono contatti per il termine"
                  />{" "}
                  <Text style={{ fontWeight: "bold" }}>{searchText}</Text>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <I18n
                    en="There are no contacts. Add some!"
                    it="Non ci sono contatti. Aggiungine qualcuno!"
                  />
                </React.Fragment>
              )}
            </Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => contactsQuery.refetch()}
          />
        }
        ListHeaderComponent={() => (
          <HorizontalLoader isLoading={contactsQuery.isFetching} />
        )}
      />
    </View>
  );
}
