import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Settings } from "../api";
import { BackButton } from "../components/BackButton";
import { Routes } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";

export function SettingsScreen({ account }: Routes["Settings"]) {
  const theme = useTheme();
  const [settings, setSettings] = useSettings();
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
        <Text
          style={{
            flex: 1,
            color: theme.textColor,
            fontWeight: "bold",
          }}
        >
          Settings
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
            Theme
          </Text>
          <ActivableButton
            label="Dark"
            isActive={settings.theme === "dark"}
            onPress={() => setSettings({ ...settings, theme: "dark" })}
          />
          <ActivableButton
            label="Light"
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
            Animations
          </Text>
          <ActivableButton
            label="Enabled"
            isActive={settings.animations === "enabled"}
            onPress={() => setSettings({ ...settings, animations: "enabled" })}
          />
          <ActivableButton
            label="Disabled"
            isActive={settings.animations === "disabled"}
            onPress={() => setSettings({ ...settings, animations: "disabled" })}
          />
        </View>
      </ScrollView>
    </View>
  );
}

type ActivableButtonProps = {
  label: string;
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
        {label}
      </Text>
    </Pressable>
  );
}

const defaultSettings: Settings = {
  theme: "dark",
  animations: "enabled",
};

export function useSettings() {
  const api = useApi();
  const queryClient = useQueryClient();
  const settingsQuery = useQuery(["settings"], async () => {
    return await api.getSettings();
  });
  const settingsMutation = useMutation(
    async (settings: Settings) => {
      await api.setSettings(settings);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["settings"]);
      },
    }
  );
  const settings = settingsQuery.data ?? defaultSettings;
  const setSettings = settingsMutation.mutate;
  return [settings, setSettings] as const;
}
