import React from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useQuery } from "react-query";
import { useRouting } from "../routing";
import { FontAwesomeIcon } from "../components/FontAwesomeIcon";
import { BackButton } from "../components/BackButton";
import { useTheme } from "../theme";
import { Avatar } from "../components/Avatar";
import { useApi } from "../ui";
import { useDebounce } from "../components/useDebounce";
import { HorizontalLoader } from "../components/HorizontalLoader";

export function AuthorsScreen() {
  const api = useApi();
  const routing = useRouting();
  const theme = useTheme();
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const searchTextDebounced = useDebounce(searchText, 300);
  const authorsQuery = useQuery(
    ["authors", { searchTextDebounced, deleted: false }],
    async () => {
      return api.getAuthors({
        nickname: searchTextDebounced || undefined,
        deleted: false,
      });
    }
  );
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColorPrimary }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
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
                paddingVertical: 16,
                borderBottomColor: "gray",
              }}
            >
              Authors
            </Text>
            <Pressable
              onPress={() => {
                setIsSearching(true);
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon icon={"search"} color={theme.textColor} />
            </Pressable>
            <Pressable
              onPress={() => {
                routing.push("AddAuthor", {});
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon icon={"plus"} color={theme.textColor} />
            </Pressable>
          </React.Fragment>
        )}
      </View>
      <HorizontalLoader isLoading={authorsQuery.isFetching} />
      <FlatList
        data={authorsQuery.data}
        renderItem={({ item: { author, nickname } }) => (
          <Pressable
            onPress={() => {
              routing.push("Author", { author, nickname });
            }}
          >
            <View style={{ flexDirection: "row", padding: 8 }}>
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
                  {author}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          authorsQuery.isLoading ? null : (
            <Text
              style={{
                color: theme.textColor,
                textAlign: "center",
                padding: 16,
              }}
            >
              {isSearching ? (
                <React.Fragment>
                  There are no Authors for term{" "}
                  <Text style={{ fontWeight: "bold" }}>{searchText}</Text>
                </React.Fragment>
              ) : (
                <React.Fragment>There are no Authors. Add some!</React.Fragment>
              )}
            </Text>
          )
        }
      />
    </View>
  );
}
