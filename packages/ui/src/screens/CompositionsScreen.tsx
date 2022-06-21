import React from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useQuery } from "react-query";
import { useRouting } from "../routing";
import { FontAwesomeIcon } from "../components/FontAwesomeIcon";
import { BackButton } from "../components/BackButton";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { CompositionListItem } from "../components/CompositionListItem";
import { useDebounce } from "../components/useDebounce";
import { HorizontalLoader } from "../components/HorizontalLoader";

export function CompositionsScreen() {
  const api = useApi();
  const routing = useRouting();
  const theme = useTheme();
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const searchTextDebounced = useDebounce(searchText, 300);
  const compositionsQuery = useQuery(
    ["compositions", { searchTextDebounced }],
    async () => {
      return api.getCompositions({ content: searchTextDebounced || undefined });
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
                paddingVertical: 16,
                borderBottomColor: "gray",
              }}
            >
              Compositions
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
                routing.push("Composition", {});
              }}
              style={{ padding: 16 }}
            >
              <FontAwesomeIcon
                icon={"feather-pointed"}
                color={theme.textColor}
              />
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
    </View>
  );
}
