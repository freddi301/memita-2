import React from "react";
import type { Props } from "@fortawesome/react-native-fontawesome";
import { Text, Platform } from "react-native";
import { useTheme } from "../theme";

if (Platform.OS == "web") {
  const { library } = require("@fortawesome/fontawesome-svg-core");
  const { fas } = require("@fortawesome/free-solid-svg-icons");
  library.add(fas);
}

// TODO fix @fortawesome/react-native-fontawesome on android
export const FontAwesomeIcon =
  //  Platform.OS === "web" ? require("@fortawesome/react-native-fontawesome").FontAwesomeIcon :
  ({ icon }: Props) => {
    const theme = useTheme();
    return <Text style={{ color: theme.textColor }}>{icon as any}</Text>;
  };
