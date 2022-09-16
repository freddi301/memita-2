import React from "react";
import { Pressable } from "react-native";
import { useTheme } from "../theme";

type AvatarProps = { size?: number; onPress?(): void };
export function Avatar({ size = 32, onPress }: AvatarProps) {
  const theme = useTheme();
  return (
    <Pressable
      style={{
        backgroundColor: theme.mockColor,
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
      onPress={onPress}
    ></Pressable>
  );
}
