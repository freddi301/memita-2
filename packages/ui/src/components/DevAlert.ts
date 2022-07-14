import { Alert, Platform } from "react-native";

export const DevAlert = {
  alert(title: string) {
    if (Platform.OS === "web") {
      this.alert(title);
    } else {
      Alert.alert(title);
    }
  },
};
