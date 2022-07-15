import { Alert, Platform } from "react-native";

export const DevAlert = {
  alert(title: string) {
    if (Platform.OS === "web") {
      window.alert(title);
    } else {
      Alert.alert(title);
    }
  },
};
