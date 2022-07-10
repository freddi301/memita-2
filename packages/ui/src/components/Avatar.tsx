import React from "react";
import { Pressable } from "react-native";
import { useTheme } from "../theme";

export function Avatar() {
  const theme = useTheme();
  return (
    <Pressable
      style={{
        backgroundColor: theme.mockColor,
        width: 32,
        height: 32,
        borderRadius: 16,
      }}
    ></Pressable>
  );
}
