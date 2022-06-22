import React from "react";
import { Pressable, View } from "react-native";
import { useRouting } from "../routing";
import { useTheme } from "../theme";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

export function HomeScreen() {
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
        <View style={{ flex: 1 }}></View>
        <Pressable
          onPress={() => {
            routing.push("Database", {});
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"database"} color={theme.textColor} />
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Authors", {});
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"users"} color={theme.textColor} />
        </Pressable>
        <Pressable
          onPress={() => {
            routing.push("Conversations", { author: "fred" /* TODO */ });
          }}
          style={{ padding: 16 }}
        >
          <FontAwesomeIcon icon={"envelope"} color={theme.textColor} />
        </Pressable>
      </View>
    </View>
  );
}
