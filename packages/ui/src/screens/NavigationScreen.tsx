import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { BackButton } from "../components/BackButton";
import { Avatar } from "../components/Avatar";
import { useQuery } from "react-query";
import { useApi } from "../ui";

export function NavigationScreen({ account }: Routes["Navigation"]) {
  const routing = useRouting();
  const theme = useTheme();
  const api = useApi();
  const accountQuery = useQuery(["account", { account }], async () => {
    return await api.getAccount({ author: account });
  });
  const connectionsQuery = useQuery(
    ["connections"],
    async () => {
      return await api.getConnections();
    },
    {
      refetchInterval: 1000,
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
        <View style={{ flexDirection: "column", paddingHorizontal: 16 }}>
          <Text style={{ color: theme.textColor, fontWeight: "bold" }}>
            {accountQuery.data?.nickname ?? ""}
          </Text>
          <Text style={{ color: theme.textColor }}>{account}</Text>
        </View>
      </View>
      <ScrollView style={{ paddingVertical: 8 }}>
        <Pressable
          onPress={() => {
            routing.push("Conversations", { account });
          }}
        >
          <Text
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              color: theme.textColor,
            }}
          >
            Conversations
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Channels", { account });
          }}
        >
          <Text
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              color: theme.textColor,
            }}
          >
            Channels
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Contacts", { account });
          }}
        >
          <Text
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              color: theme.textColor,
            }}
          >
            Contacts
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Account", { account });
          }}
        >
          <Text
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              color: theme.textColor,
            }}
          >
            Your Account
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Settings", { account });
          }}
        >
          <Text
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              color: theme.textColor,
            }}
          >
            Settings
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Database", { account });
          }}
        >
          <Text
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              color: theme.textColor,
            }}
          >
            Database
          </Text>
        </Pressable>
        <Text
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            color: theme.textSecondaryColor,
          }}
        >
          Connections: {JSON.stringify(connectionsQuery.data, null, 2)}
        </Text>
      </ScrollView>
    </View>
  );
}
