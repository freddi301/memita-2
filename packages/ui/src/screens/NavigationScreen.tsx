import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { BackButton } from "../components/BackButton";
import { Avatar } from "../components/Avatar";
import { useQuery } from "react-query";
import { useApi } from "../ui";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { I18n } from "../components/I18n";

export function NavigationScreen({ account }: Routes["Navigation"]) {
  const routing = useRouting();
  const theme = useTheme();
  const api = useApi();
  const accountQuery = useQuery(["account", { author: account }], async () => {
    return await api.getAccount({ author: account });
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
          <Text style={{ color: theme.textColor }}>{account}</Text>
        </View>
      </View>
      <ScrollView style={{ paddingVertical: 8 }}>
        <Pressable
          onPress={() => {
            routing.push("Conversations", { account });
          }}
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <FontAwesomeIcon icon={"comments"} color={theme.actionTextColor} />
          <Text
            style={{
              color: theme.textColor,
              marginLeft: 16,
            }}
          >
            <I18n en="Conversations" it="Conversazioni" />
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Channels", { account });
          }}
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <FontAwesomeIcon icon={"bullhorn"} color={theme.actionTextColor} />
          <Text
            style={{
              color: theme.textColor,
              marginLeft: 16,
            }}
          >
            <I18n en="Channels" it="Canali" />
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Contacts", { account });
          }}
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <FontAwesomeIcon
            icon={"address-book"}
            color={theme.actionTextColor}
          />
          <Text
            style={{
              color: theme.textColor,
              marginLeft: 16,
            }}
          >
            <I18n en="Contacts" it="Contatti" />
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Account", { account });
          }}
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <FontAwesomeIcon icon={"user"} color={theme.actionTextColor} />
          <Text
            style={{
              color: theme.textColor,
              marginLeft: 16,
            }}
          >
            <I18n en="Account" it="Account" />
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Settings", { account });
          }}
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <FontAwesomeIcon icon={"wrench"} color={theme.actionTextColor} />
          <Text
            style={{
              color: theme.textColor,
              marginLeft: 16,
            }}
          >
            <I18n en="Settings" it="Impostazioni" />
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Connectivity", { account });
          }}
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <FontAwesomeIcon icon={"wifi"} color={theme.actionTextColor} />
          <Text
            style={{
              color: theme.textColor,
              marginLeft: 16,
            }}
          >
            <I18n en="Connectivity" it="Connettività" />
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Database", { account });
          }}
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <FontAwesomeIcon icon={"database"} color={theme.actionTextColor} />
          <Text
            style={{
              color: theme.textColor,
              marginLeft: 16,
            }}
          >
            <I18n en="Database" it="Database" />
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
