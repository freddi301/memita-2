import React from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { Avatar } from "../components/Avatar";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useQuery } from "react-query";
import { useApi } from "../ui";
import { DateTime } from "luxon";
import { HorizontalLoader } from "../components/HorizontalLoader";
import { I18n } from "../components/I18n";
import { formatAuthor } from "../components/format";
import { PublicMessage } from "../api";
import { DevAlert } from "../components/DevAlert";

export function ProfileScreen({ account, author }: Routes["Profile"]) {
  const theme = useTheme();
  const routing = useRouting();
  const api = useApi();
  const contactQuery = useQuery(["contact", { account, author }], async () => {
    return await api.getContact({ account, author });
  });
  const postsQuery = useQuery(["posts", { author }], async () => {
    return [] as Array<PublicMessage>;
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
        <BackButton />
        <Avatar />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text
            style={{
              color: theme.textColor,
              fontWeight: "bold",
            }}
          >
            {contactQuery.data?.nickname ?? ""}
          </Text>
          <Text
            style={{
              color: theme.textColor,
            }}
          >
            {formatAuthor(author)}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            routing.push("Contact", { account, author });
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"pen"} color={theme.actionTextColor} />
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Pressable
          onPress={() => {
            routing.push("Conversation", { account, other: author });
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"envelope"} color={theme.actionTextColor} />
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
            <I18n en="Posts" it="I Post" />
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={postsQuery.data}
        renderItem={({
          item: { author, quote, salt, version_timestamp, content },
        }) => {
          const datetime = DateTime.fromMillis(version_timestamp);
          return (
            <Pressable
              onPress={() => {
                DevAlert.alert("Coming soon");
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
          postsQuery.isLoading ? null : (
            <Text
              style={{
                color: theme.textColor,
                textAlign: "center",
                padding: 16,
              }}
            >
              <I18n en="No posts" it="Nessun post" />
            </Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => postsQuery.refetch()}
          />
        }
        ListHeaderComponent={() => (
          <HorizontalLoader isLoading={postsQuery.isFetching} />
        )}
      />
    </View>
  );
}
