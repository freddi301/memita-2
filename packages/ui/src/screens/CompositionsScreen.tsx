import React from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useQuery } from "react-query";
import { useRouting } from "../routing";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BackButton } from "../components/BackButton";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { useDebounce } from "../components/useDebounce";
import { HorizontalLoader } from "../components/HorizontalLoader";
import { Avatar } from "../components/Avatar";
import { DateTime } from "luxon";

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
        renderItem={({
          item: {
            author,
            channel,
            recipient,
            quote,
            salt,
            version_timestamp,
            content,
            versions,
          },
        }) => {
          const datetime = DateTime.fromMillis(version_timestamp);
          return (
            <Pressable
              onPress={() => {
                routing.push("Composition", {
                  author,
                  channel,
                  recipient,
                  quote,
                  salt,
                  ...(content ? { content } : {}),
                });
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
                <View style={{ marginHorizontal: 8, flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {!!channel && (
                      <Text style={{ color: theme.textColor }}>
                        {channel} |{" "}
                      </Text>
                    )}
                    <Text
                      style={{
                        color: theme.textColor,
                        fontWeight: "bold",
                        flex: 1,
                      }}
                    >
                      {author}
                    </Text>
                    {!!recipient && (
                      <React.Fragment>
                        <View style={{ marginHorizontal: 8 }}>
                          <FontAwesomeIcon
                            icon={"arrow-right"}
                            color={theme.textColor}
                          />
                        </View>
                        <Text
                          style={{
                            color: theme.textColor,
                            fontWeight: "bold",
                            flex: 1,
                          }}
                        >
                          {recipient}
                        </Text>
                      </React.Fragment>
                    )}
                  </View>
                  <Text
                    style={{
                      color: theme.textColor,
                    }}
                  >
                    {content}
                  </Text>
                </View>
                <View>
                  <View style={{ flexDirection: "row" }}>
                    {!!quote && (
                      <View style={{ marginRight: 8 }}>
                        <FontAwesomeIcon
                          icon={"reply"}
                          color={theme.textColor}
                        />
                      </View>
                    )}
                    {versions > 1 && (
                      <View style={{ marginRight: 8 }}>
                        <FontAwesomeIcon
                          icon={"clock-rotate-left"}
                          color={theme.textColor}
                        />
                      </View>
                    )}
                    <Text
                      style={{
                        color: theme.textColor,
                        textAlign: "right",
                        flex: 1,
                      }}
                    >
                      {datetime.toLocaleString(DateTime.TIME_WITH_SECONDS)}
                    </Text>
                  </View>
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
