import React from "react";
import { Pressable } from "react-native";
import { useTheme } from "../theme";

type AvatarProps = { size?: number };
export function Avatar({ size = 32 }: AvatarProps) {
  const theme = useTheme();
  return (
    <Pressable
      style={{
        backgroundColor: theme.mockColor,
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    ></Pressable>
  );
}
