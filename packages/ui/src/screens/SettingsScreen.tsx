import { AccountId, Settings } from "@memita-2/core";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { BackButton } from "../components/BackButton";
import { I18n } from "../components/I18n";
import { Routes } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";
import { defaultSettings } from "./account/CreateNewAccountScreen";

export function SettingsScreen({ account }: Routes["Settings"]) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const api = useApi();
  const accountQuery = useQuery(["account", { account }], async () => {
    return await api.getAccount({ account });
  });
  const settings = accountQuery.data?.settings ?? defaultSettings;
  const updateAccountMutation = useMutation(
    async ({
      account,
      nickname,
      settings,
    }: {
      account: AccountId;
      nickname: string;
      settings: Settings;
    }) => {
      await api.updateAccount({ account, nickname, settings });
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["account"]);
      },
    }
  );
  const setSettings = (settings: Settings) => {
    if (accountQuery.data) {
      const { nickname } = accountQuery.data;
      updateAccountMutation.mutate({ account, nickname, settings });
    }
  };
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
          <I18n en="Settings" it="Impostazioni" />
        </Text>
      </View>
      <ScrollView style={{ paddingVertical: 8 }}>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              color: theme.textColor,
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <I18n en="Language" it="Lingua" />
          </Text>
          <ActivableButton
            label="Eng"
            isActive={settings.language === "en"}
            onPress={() => setSettings({ ...settings, language: "en" })}
          />
          <ActivableButton
            label="Ita"
            isActive={settings.language === "it"}
            onPress={() => setSettings({ ...settings, language: "it" })}
          />
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              color: theme.textColor,
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <I18n en="Theme" it="Tema" />
          </Text>
          <ActivableButton
            label={<I18n en="Dark" it="Scuro" />}
            isActive={settings.theme === "dark"}
            onPress={() => setSettings({ ...settings, theme: "dark" })}
          />
          <ActivableButton
            label={<I18n en="Light" it="Chiaro" />}
            isActive={settings.theme === "light"}
            onPress={() => setSettings({ ...settings, theme: "light" })}
          />
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              color: theme.textColor,
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <I18n en="Animations" it="Animazioni" />
          </Text>
          <ActivableButton
            label={<I18n en="Enabled" it="Abilitate" />}
            isActive={settings.animations === "enabled"}
            onPress={() => setSettings({ ...settings, animations: "enabled" })}
          />
          <ActivableButton
            label={<I18n en="Disabled" it="Disabilitate" />}
            isActive={settings.animations === "disabled"}
            onPress={() => setSettings({ ...settings, animations: "disabled" })}
          />
        </View>
      </ScrollView>
    </View>
  );
}

type ActivableButtonProps = {
  label: React.ReactNode;
  isActive: boolean;
  onPress(): void;
};
function ActivableButton({ label, isActive, onPress }: ActivableButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      style={{
        borderBottomWidth: 2,
        borderColor: isActive ? theme.activeColor : "transparent",
      }}
      onPress={onPress}
    >
      <Text
        style={{
          color: theme.textColor,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        {label as any}
      </Text>
    </Pressable>
  );
}
