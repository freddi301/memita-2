import React from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { useQuery } from "react-query";
import { Avatar } from "../components/Avatar";
import { BackButton } from "../components/BackButton";
import { formatAuthor } from "../components/format";
import { HorizontalLoader } from "../components/HorizontalLoader";
import { I18n } from "../components/I18n";
import { PublicMessageView } from "../components/PublicMessageView";
import { Routes } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";

export function FeedScreen({ account }: Routes["Navigation"]) {
  const theme = useTheme();
  const api = useApi();
  const accountQuery = useQuery(["account", { account }], async () => {
    return await api.getAccount({ account });
  });
  const feedQuery = useQuery(["feed", { account }], async () => {
    return await api.getPublicMessagesFeed({ account });
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
        <View
          style={{ flexDirection: "column", paddingHorizontal: 16, flex: 1 }}
        >
          <Text style={{ color: theme.textColor, fontWeight: "bold" }}>
            {accountQuery.data?.nickname ?? ""}
          </Text>
          <Text style={{ color: theme.textColor }}>
            {formatAuthor(account)}
          </Text>
        </View>
      </View>
      <FlatList
        data={feedQuery.data}
        renderItem={({ item }) => {
          return <PublicMessageView account={account} publicMessage={item} />;
        }}
        ListEmptyComponent={
          feedQuery.isLoading ? null : (
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
            onRefresh={() => feedQuery.refetch()}
          />
        }
        ListHeaderComponent={() => (
          <HorizontalLoader isLoading={feedQuery.isFetching} />
        )}
      />
    </View>
  );
}
