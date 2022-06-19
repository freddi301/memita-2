import React from "react";
import { Pressable, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import { SimpleInput } from "../components/SimpleInput";
import { Routes } from "../routing";
import { useTheme } from "../theme";
import { Avatar } from "./Avatar";

export function ProfileScreen({ id }: Routes["Profile"]) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColorPrimary }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.backgroundColorSecondary,
          alignItems: "center",
        }}
      >
        <BackButton />
        <Avatar />
        <Text
          style={{
            color: theme.textColor,
            fontWeight: "bold",
            paddingVertical: "16px",
            borderBottomColor: "gray",
            flex: 1,
            marginLeft: 8,
          }}
        >
          {id}
        </Text>
      </View>
    </View>
  );
}
