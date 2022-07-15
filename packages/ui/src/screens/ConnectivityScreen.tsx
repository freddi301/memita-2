import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Account, Settings } from "../api";
import { BackButton } from "../components/BackButton";
import { DevAlert } from "../components/DevAlert";
import { I18n } from "../components/I18n";
import { Routes } from "../routing";
import { useTheme } from "../theme";
import { OverridesContext, useApi } from "../ui";
import { defaultSettings } from "./account/CreateNewAccountScreen";

export function ConnectivityScreen({ account }: Routes["Connectivity"]) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const api = useApi();
  const accountQuery = useQuery(["account", { author: account }], async () => {
    return await api.getAccount({ author: account });
  });
  const settings = accountQuery.data?.settings ?? defaultSettings;
  const accountMutation = useMutation(
    async (account: Account) => {
      await api.addAccount(account);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["account"]);
      },
    }
  );
  const setSettings = (settings: Settings) => {
    if (accountQuery.data) {
      accountMutation.mutate({ ...accountQuery.data, settings });
    }
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
  const { copyToClipboard } = React.useContext(OverridesContext);
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
            alignItems: "center",
          }}
        >
          <Text style={{ flex: 1, color: theme.textColor }}>
            <I18n en="Hyper Swarm" it="Hyper Swarm" /> (
            {connectionsQuery.data?.hyperswarm.connections})
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
            paddingHorizontal: 16,
            paddingBottom: 8,
            color: theme.textSecondaryColor,
          }}
        >
          <I18n
            en="Connect directly to other devices using peer-to-peer technology without relying on a server"
            it="Connettiti direttamente agli altri dispositivi usando la tecnologia peer-to-peer senza affidarti ad un server"
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
            <I18n en="Bridge Client" it="Bridge Client" />
          </Text>
        </View>
        <Text
          style={{
            paddingHorizontal: 16,
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
            <BridgeClientEntry
              key={index}
              value={bridge}
              onChange={(bridge) => {
                const clients = [...settings.connectivity.bridge.clients];
                clients[index] = bridge;
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
              isOnline={connectionsQuery.data?.bridge.clients[index].online}
              connections={
                connectionsQuery.data?.bridge.clients[index].connections
              }
            />
          );
        })}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ flex: 1, color: theme.textColor }}>
            <I18n en="Bridge Server" it="Bridge Server" />
            {connectionsQuery.data?.bridge.server && (
              <React.Fragment>
                {" "}
                ({connectionsQuery.data?.bridge.server?.connections})
              </React.Fragment>
            )}
          </Text>
          <Pressable
            onPress={() =>
              setSettings({
                ...settings,
                connectivity: {
                  ...settings.connectivity,
                  bridge: {
                    ...settings.connectivity.bridge,
                    server: {
                      ...settings.connectivity.bridge.server,
                      enabled: !settings.connectivity.bridge.server.enabled,
                    },
                  },
                },
              })
            }
          >
            <FontAwesomeIcon
              icon={"power-off"}
              color={
                settings.connectivity.bridge.server.enabled
                  ? theme.activeColor
                  : theme.textSecondaryColor
              }
            />
          </Pressable>
        </View>
        <Text
          style={{
            paddingHorizontal: 16,
            paddingBottom: 8,
            color: theme.textSecondaryColor,
          }}
        >
          <I18n
            en="Let connect other devices trough your device"
            it="Permetti agli altri dispositivi di connetersi attraverso il tuo"
          />
        </Text>
        {connectionsQuery.data?.bridge.server &&
          connectionsQuery.data?.bridge.server.adresses.map((address) => {
            return (
              <View
                key={address}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    color: theme.textColor,
                    flex: 1,
                  }}
                >
                  <Text style={{ color: theme.textSecondaryColor }}>
                    LAN IP{" "}
                  </Text>
                  {address}:{connectionsQuery.data?.bridge.server?.port}
                </Text>
                <Pressable
                  onPress={() => {
                    copyToClipboard(
                      `${address}:${connectionsQuery.data?.bridge.server?.port}`
                    );
                    DevAlert.alert("copied to clipboard");
                  }}
                >
                  <FontAwesomeIcon
                    icon={"clipboard"}
                    color={theme.actionTextColor}
                  />
                </Pressable>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}

type BridgeClientEntryProps = {
  value: Settings["connectivity"]["bridge"]["clients"][number];
  onChange(value: Settings["connectivity"]["bridge"]["clients"][number]): void;
  connections: number | undefined;
  isOnline: boolean | undefined;
};
function BridgeClientEntry({
  value,
  onChange,
  connections,
  isOnline,
}: BridgeClientEntryProps) {
  const theme = useTheme();
  const [isModifying, setIsModifying] = React.useState(false);
  const [addressText, setAddressText] = React.useState("");
  if (isModifying) {
    return (
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 8,
          alignItems: "center",
        }}
      >
        <TextInput
          placeholder="example.com:8080"
          value={addressText}
          onChangeText={setAddressText}
          style={{
            color: theme.textColor,
            borderBottomWidth: 1,
            borderStyle: "dashed",
            borderColor: theme.textColor,
            minWidth: 0,
            flex: 1,
            padding: 0,
            height: 16,
          }}
        />
        <Pressable
          onPress={() => {
            const [, host, port] =
              addressText.match(
                /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|[a-z0-9]+\.[a-z]+):([0-9]{1,5})/i
              ) ?? [];
            if (host && port) {
              setIsModifying(false);
              onChange({ ...value, host, port: Number(port) });
            } else {
              DevAlert.alert("invalid address");
            }
          }}
          style={{ marginLeft: 16 }}
        >
          <FontAwesomeIcon icon={"check"} color={theme.actionTextColor} />
        </Pressable>
        <Pressable
          onPress={() => {
            setIsModifying(false);
          }}
          style={{ marginLeft: 16 }}
        >
          <FontAwesomeIcon icon={"rotate-left"} color={theme.actionTextColor} />
        </Pressable>
      </View>
    );
  }
  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: "center",
      }}
    >
      <FontAwesomeIcon
        icon={"signal"}
        color={isOnline ? theme.activeColor : theme.errorColor}
      />
      <Text
        style={{
          color: theme.textColor,
          flex: 1,
          marginLeft: 8,
        }}
      >
        {value.host}:{value.port} ({connections})
      </Text>
      {!value.enabled && !isModifying && (
        <Pressable
          onPress={() => {
            setIsModifying(true);
            setAddressText(`${value.host}:${value.port}`);
          }}
          style={{ marginRight: 16 }}
        >
          <FontAwesomeIcon icon={"pen"} color={theme.actionTextColor} />
        </Pressable>
      )}
      <Pressable
        onPress={() => {
          onChange({ ...value, enabled: !value.enabled });
        }}
      >
        <FontAwesomeIcon
          icon={"power-off"}
          color={value.enabled ? theme.activeColor : theme.textSecondaryColor}
        />
      </Pressable>
    </View>
  );
}
