import React from "react";
import {
  Appearance,
  Pressable,
  Text,
  View,
  NativeModules,
  Platform,
} from "react-native";
import { useMutation, useQueryClient } from "react-query";
import { Routes, useRouting } from "../../routing";
import { useTheme } from "../../theme";
import { useApi } from "../../ui";
import { BackButton } from "../../components/BackButton";
import { SimpleInput } from "../../components/SimpleInput";
import { I18n } from "../../components/I18n";
import { Avatar } from "../../components/Avatar";
import { Settings } from "@memita-2/core";

export function CreateNewAccountScreen({
  ...original
}: Routes["CreateNewAccount"]) {
  const routing = useRouting();
  const theme = useTheme();
  const [nickname, setNickname] = React.useState("");
  const api = useApi();
  const queryClient = useQueryClient();
  const createAccountMutation = useMutation(
    async ({
      nickname,
      settings,
    }: {
      nickname: string;
      settings: Settings;
    }) => {
      return await api.createAccount({ nickname, settings });
    },
    {
      onSuccess({ account }) {
        queryClient.invalidateQueries(["accounts"]);
        routing.back();
        routing.push("Navigation", { account: account });
      },
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
            color: theme.textColor,
            fontWeight: "bold",
            flex: 1,
          }}
        >
          <I18n en="Creating new account" it="Creazione di un nuovo account" />
        </Text>
      </View>
      <View
        style={{
          alignItems: "center",
          justifyContent: "space-evenly",
          flex: 1,
        }}
      >
        <Text></Text>
        <Avatar size={96} />
        <SimpleInput
          label={<I18n en="Nickname" it="Soprannome" />}
          value={nickname}
          onChangeText={setNickname}
          description={
            <I18n
              en="An friendly name to help you remeber which account this is. It is visible only to you. Can be modified later."
              it="Un nome mnemonico per aiutarti a ricordare di quale account si tratta. E visibile solo a te. Può essere modificato in seguito."
            />
          }
        />
        <Pressable
          onPress={() => {
            createAccountMutation.mutate({
              nickname,
              settings: defaultSettings,
            });
          }}
          style={{ padding: 16 }}
        >
          <Text
            style={{
              color: theme.actionTextColor,
              textDecorationLine: "underline",
            }}
          >
            <I18n en="Create new account" it="Crea nuovo account" />
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export const defaultSettings: Settings = {
  language: getSystemLocale(),
  theme: Appearance.getColorScheme() ?? "dark",
  animations: "enabled",
  connectivity: {
    hyperswarm: {
      enabled: true,
    },
    bridge: {
      server: { enabled: false },
      clients: [
        { enabled: false, port: 8001, host: "127.0.0.1" },
        { enabled: false, port: 8001, host: "127.0.0.1" },
        { enabled: false, port: 8001, host: "127.0.0.1" },
        { enabled: false, port: 8001, host: "127.0.0.1" },
      ],
    },
    lan: {
      enabled: true,
    },
  },
};

function getSystemLocale() {
  switch (Platform.OS) {
    case "android":
      return NativeModules.I18nManager.localeIdentifier.slice(0, 2);
    case "ios":
      return (
        NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]
      );
    case "web":
      return (navigator.languages[0] || navigator.language).slice(0, 2);
  }
}
