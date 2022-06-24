import React from "react";
import { ScrollView, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import { Routes, useRouting } from "../routing";
import { useTheme } from "../theme";
import { useApi } from "../ui";

export function SettingsScreen({ account }: Routes["Settings"]) {
  const api = useApi();
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
      <ScrollView>
        <Text>Animations</Text>
        <Text>Theme</Text>
      </ScrollView>
    </View>
  );
}
