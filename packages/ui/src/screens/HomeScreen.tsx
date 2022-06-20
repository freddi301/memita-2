import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouting } from "../routing";
import { useTheme } from "../theme";

export function HomeScreen() {
  const routing = useRouting();
  const theme = useTheme();
  const entryStyle = {
    padding: "16px",
    color: theme.textColor,
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColorPrimary }}>
      <Text
        style={{
          color: theme.textColor,
          fontWeight: "bold",
          padding: "16px",
          borderBottomColor: "gray",
          backgroundColor: theme.backgroundColorSecondary,
        }}
      >
        Home
      </Text>
      <Pressable
        onPress={() => {
          routing.push("Blocks", {});
        }}
      >
        <Text style={entryStyle}>Blocks</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          routing.push("Profiles", {});
        }}
      >
        <Text style={entryStyle}>Profiles</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          routing.push("Compositions", {});
        }}
      >
        <Text style={entryStyle}>Compositions</Text>
      </Pressable>
    </View>
  );
}
