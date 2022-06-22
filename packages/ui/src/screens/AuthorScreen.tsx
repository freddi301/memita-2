import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { Avatar } from "../components/Avatar";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useMutation, useQuery } from "react-query";
import { useApi } from "../ui";
import { DateTime } from "luxon";

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
        label: "deleted",
        version_timestamp,
      });
    },
    {
      onSuccess() {
        routing.back();
      },
    }
  );
  const compositionsQuery = useQuery(
    ["compositions", { author, channel: "", quote: "", recipient: "" }],
    async () => {
      return api.getCompositions({
        author,
        channel: "",
        quote: "",
        recipient: "",
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
            routing.push("AuthorEdit", { author, nickname });
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"pen"} color={theme.textColor} />
        </Pressable>
        <Pressable
          onPress={() => {
            deleteAuthorMutation.mutate(author);
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"trash"} color={theme.textColor} />
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Pressable
          onPress={() => {
            routing.push("Conversation", {
              author: "fred" /* TODO */,
              recipient: author,
            });
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"envelope"} color={theme.textColor} />
        </Pressable>
      </View>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
        }}
      >
        <Pressable>
          <Text
            style={{
              color: theme.textColor,
              fontWeight: "bold",
              paddingVertical: 16 - 2,
              paddingHorizontal: 16,
              borderBottomWidth: 4,
              borderColor: theme.activeColor,
            }}
          >
            Posts
          </Text>
        </Pressable>
      </View>
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
        style={{ paddingVertical: 8 }}
        ListEmptyComponent={
          compositionsQuery.isLoading ? null : (
            <Text
              style={{
                color: theme.textColor,
                textAlign: "center",
                padding: 16,
              }}
            >
              No posts
            </Text>
          )
        }
      />
    </View>
  );
}
