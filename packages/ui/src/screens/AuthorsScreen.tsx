import React from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useQuery } from "react-query";
import { useRouting } from "../routing";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { useTheme } from "../theme";
import { Avatar } from "../components/Avatar";
import { useApi } from "../ui";
import { useDebounce } from "../components/useDebounce";

export function AuthorsScreen() {
  const api = useApi();
  const routing = useRouting();
  const theme = useTheme();
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const searchTextDebounced = useDebounce(searchText, 300);
  const profilesQuery = useQuery(
    ["profiles", { searchTextDebounced }],
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
            <View style={{ padding: 16 }}>
              <FontAwesomeIcon icon={"search"} color={theme.textColor} />
            </View>
            <TextInput
              value={searchText}
              onChangeText={(newText) => {
                setSearchText(newText);
              }}
              style={{
                color: theme.textColor,
                flex: 1,
                paddingVertical: 16,
              }}
              autoFocus
            />
            <Pressable
              onPress={() => {
                setIsSearching(false);
                setSearchText("");
              }}
              style={{ padding: "16px" }}
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
                paddingVertical: "16px",
                borderBottomColor: "gray",
              }}
            >
              Authors
            </Text>
            <Pressable
              onPress={() => {
                setIsSearching(true);
              }}
              style={{ padding: "16px" }}
            >
              <FontAwesomeIcon icon={"search"} color={theme.textColor} />
            </Pressable>
            <Pressable
              onPress={() => {
                routing.push("AddAuthor", {});
              }}
              style={{ padding: "16px" }}
            >
              <FontAwesomeIcon icon={"plus"} color={theme.textColor} />
            </Pressable>
          </React.Fragment>
        )}
      </View>
      <FlatList
        data={profilesQuery.data}
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
          <Text
            style={{
              color: theme.textColor,
              textAlign: "center",
              padding: 16,
            }}
          >
            {isSearching ? (
              <React.Fragment>
                There are no profiles for term{" "}
                <Text style={{ fontWeight: "bold" }}>{searchText}</Text>
              </React.Fragment>
            ) : (
              <React.Fragment>There are no profiles. Add some!</React.Fragment>
            )}
          </Text>
        }
      />
    </View>
  );
}
