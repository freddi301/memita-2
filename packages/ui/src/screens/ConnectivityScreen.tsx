import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
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
    ["connections", { account }],
    async () => {
      return await api.getConnections(account);
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
      <ScrollView style={{ paddingTop: 8 }}>
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text style={{ flex: 1, color: theme.textColor }}>
            <I18n en="Hyperswarm" it="Hyperswarm" /> (
            {connectionsQuery.data?.hyperswarm})
          </Text>
          <Pressable
            onPress={() =>
              setSettings({
                ...settings,
                connectivity: {
                  ...settings.connectivity,
                  hyperswarm: {
                    ...settings.connectivity.hyperswarm,
                    enabled: !settings.connectivity.hyperswarm.enabled,
                  },
                },
              })
            }
          >
            <FontAwesomeIcon
              icon={"power-off"}
              color={
                settings.connectivity.hyperswarm.enabled
                  ? theme.activeColor
                  : theme.textSecondaryColor
              }
            />
          </Pressable>
        </View>
        <Text
          style={{
            paddingHorizontal: 18,
            paddingBottom: 8,
            color: theme.textSecondaryColor,
          }}
        >
          <I18n
            en="Connect directly to other devices using peer-to-peer technology without relying on a server"
            it="Connettiti direttamente agli altri dispositivi usando la tecnlogia peer-to-peer senza affidarti ad un server"
          />
        </Text>
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text style={{ flex: 1, color: theme.textColor }}>
            <I18n en="Bridge" it="Ponte" />
          </Text>
        </View>
        <Text
          style={{
            paddingHorizontal: 18,
            paddingBottom: 8,
            color: theme.textSecondaryColor,
          }}
        >
          <I18n
            en="Connect to other devices trough a server"
            it="Connettiti agli altri dispositivi usando un server"
          />
        </Text>
        {settings.connectivity.bridge.clients.map((bridge, index) => {
          return (
            <View
              key={index}
              style={{
                flexDirection: "row",
                paddingHorizontal: 18,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: theme.textColor, flex: 1 }}>
                {bridge.host}:{bridge.port} (
                {connectionsQuery.data?.bridge[index]})
              </Text>
              <Pressable
                onPress={() => {
                  const clients = [...settings.connectivity.bridge.clients];
                  clients[index].enabled = !clients[index].enabled;
                  setSettings({
                    ...settings,
                    connectivity: {
                      ...settings.connectivity,
                      bridge: {
                        ...settings.connectivity.bridge,
                        clients,
                      },
                    },
                  });
                }}
              >
                <FontAwesomeIcon
                  icon={"power-off"}
                  color={
                    bridge.enabled
                      ? theme.activeColor
                      : theme.textSecondaryColor
                  }
                />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
