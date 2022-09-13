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
import { DevAlert } from "../components/DevAlert";
import { MessageAttachments } from "../components/MessageAttachments";

export function ProfileScreen({ account, author }: Routes["Profile"]) {
  const theme = useTheme();
  const routing = useRouting();
  const api = useApi();
  const contactQuery = useQuery(
    ["contact", { account, author }],
    async () => {
      return await api.getContact({ account, author });
    },
    {
      enabled: account !== author,
    }
  );
  const accountQuery = useQuery(
    ["account", { account }],
    async () => {
      return await api.getAccount({ author: account });
    },
    {
      enabled: account === author,
    }
  );
  const postsQuery = useQuery(
    ["public-messages", { account, author }],
    async () => {
      return await api.getPublicMessages({ account, author });
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
        <BackButton />
        <Avatar />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text
            style={{
              color: theme.textColor,
              fontWeight: "bold",
            }}
          >
            {contactQuery.data?.nickname ?? accountQuery.data?.nickname ?? ""}
          </Text>
          <Text
            style={{
              color: theme.textColor,
            }}
          >
            {formatAuthor(author)}
          </Text>
        </View>
        {account === author ? (
          <Pressable
            onPress={() => {
              routing.push("YourAccount", { account });
            }}
            style={{ padding: 16 }}
          >
            <FontAwesomeIcon icon={"cog"} color={theme.actionTextColor} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              routing.push("Contact", { account, author });
            }}
            style={{ padding: 16 }}
          >
            <FontAwesomeIcon icon={"pen"} color={theme.actionTextColor} />
          </Pressable>
        )}
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
          item: { author, content, attachments, version_timestamp },
        }) => {
          const datetime = DateTime.fromMillis(version_timestamp);
          return (
            <View>
              <Pressable
                onPress={() => {
                  DevAlert.alert("Coming soon");
                }}
                style={{
                  flexDirection: "row",
                  paddingVertical: 8,
                }}
              >
                <View style={{ paddingHorizontal: 8 }}>
                  <Avatar />
                </View>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        color: theme.textColor,
                        fontWeight: "bold",
                        flex: 1,
                      }}
                    >
                      {author === account
                        ? accountQuery.data?.nickname
                        : contactQuery.data?.nickname}
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
                    }}
                  >
                    {content}
                  </Text>
                </View>
              </Pressable>
              {attachments.length > 0 && (
                <MessageAttachments attachments={attachments} />
              )}
            </View>
          );
        }}
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
      {author === account && (
        <Pressable
          style={{
            padding: 16,
            position: "absolute",
            bottom: 8,
            right: 8,
            backgroundColor: theme.backgroundColorSecondary,
            borderRadius: 24,
          }}
          onPress={() => {
            routing.push("ComposePublicMessage", { account });
          }}
        >
          <FontAwesomeIcon icon={"feather"} color={theme.actionTextColor} />
        </Pressable>
      )}
    </View>
  );
}
