import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useQuery } from "react-query";
import { Settings } from "../api";
import { BackButton } from "../components/BackButton";
import { I18n } from "../components/I18n";
import { Routes } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { useAccount } from "./AccountScreen";

export function ConnectivityScreen({ account }: Routes["Connectivity"]) {
  const theme = useTheme();
  const api = useApi();
  const [{ settings, ...rest }, setAccount] = useAccount(account);
  const setSettings = (settings: Settings) => {
    setAccount({ ...rest, settings });
  };
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
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
        }}
      >
        <BackButton />
        <Text
          style={{
            flex: 1,
            color: theme.textColor,
            fontWeight: "bold",
          }}
        >
          <I18n en="Connectivity" it="Connettività" />
        </Text>
      </View>
      <ScrollView>
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
