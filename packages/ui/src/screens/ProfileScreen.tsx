import React from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { Avatar } from "../components/Avatar";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useQuery } from "react-query";
import { useApi } from "../ui";
import { HorizontalLoader } from "../components/HorizontalLoader";
import { I18n } from "../components/I18n";
import { formatAuthor } from "../components/format";
import { PublicMessageView } from "../components/PublicMessageView";

export function ProfileScreen({ account, author }: Routes["Profile"]) {
  const theme = useTheme();
  const routing = useRouting();
  const api = useApi();
  const contactQuery = useQuery(
    ["contact", { account, author }],
    async () => {
      return await api.getContact({ account, contact: author });
    },
    {
      enabled: account !== author,
    }
  );
  const accountQuery = useQuery(
    ["account", { account }],
    async () => {
      return await api.getAccount({ account });
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
            {(account === author
              ? accountQuery.data?.nickname
              : contactQuery.data?.nickname) ?? ""}
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
              routing.push("Contact", { account, contact: author });
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
        renderItem={({ item }) => {
          return <PublicMessageView account={account} publicMessage={item} />;
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
