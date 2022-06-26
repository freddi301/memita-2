import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { BackButton } from "../components/BackButton";

export function NavigationScreen({ account }: Routes["Navigation"]) {
  const routing = useRouting();
  const theme = useTheme();
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
            routing.push("Account", { author: account });
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
      </ScrollView>
    </View>
  );
}
