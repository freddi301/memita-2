import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Settings } from "../api";
import { BackButton } from "../components/BackButton";
import { I18n } from "../components/I18n";
import { Routes } from "../routing";
import { useTheme } from "../theme";
import { useAccount } from "./AccountScreen";

export function SettingsScreen({ account }: Routes["Settings"]) {
  const theme = useTheme();
  const [{ settings, ...rest }, setAccount] = useAccount(account);
  const setSettings = (settings: Settings) => {
    setAccount({ ...rest, settings });
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
