import React from "react";
import { Pressable } from "react-native";
import { useRouting } from "../routing";
import { FontAwesomeIcon } from "./FontAwesomeIcon";
import { useTheme } from "../theme";

export function BackButton() {
  const routing = useRouting();
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => {
        routing.back();
      }}
      style={{
        padding: 16,
      }}
    >
      <FontAwesomeIcon icon={"chevron-left"} color={theme.textColor} />
    </Pressable>
  );
}
